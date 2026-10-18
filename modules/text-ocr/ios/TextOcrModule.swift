import ExpoModulesCore
import TesseractKit
import UIKit
import Vision

// Text recognition. Returns lines with their position as fractions of the image (origin top-left).
// Apple Vision reads Latin and Russian text well but has no Uzbek Cyrillic letters (ў қ ғ ҳ), so whenever Uzbek (Cyrillic)
// is asked for, Tesseract (models in TextOcrData.bundle, the same ones Android uses) does the whole job.
public class TextOcrModule: Module {
  public func definition() -> ModuleDefinition {
    Name("TextOcr")

    AsyncFunction("recognize") { (uri: String, langs: [String]) -> [String: Any] in
      guard let url = URL(string: uri), let image = UIImage(contentsOfFile: url.path), let cg = image.cgImage else {
        throw Exception(name: "ERR_OCR_IMAGE", description: "Cannot read the image")
      }
      let lines = langs.contains("uz-cyrl") ? try Self.tesseract(cg, langs) : try Self.vision(cg, langs)
      return ["width": cg.width, "height": cg.height, "lines": lines]
    }
  }

  private static let tessCodes = ["uz": "uzb", "uz-cyrl": "uzb_cyrl", "ru": "rus", "en": "eng"]
  private static let tessLock = NSLock() // one recognition at a time: the engine is heavy

  private static func vision(_ cg: CGImage, _ langs: [String]) throws -> [[String: Any]] {
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    // Uzbek Latin has no Vision model: it is read as English, without the dictionary "fixing" the words.
    request.usesLanguageCorrection = !langs.contains("uz")
    let supported = Set((try? request.supportedRecognitionLanguages()) ?? [])
    var wanted: [String] = []
    for l in langs {
      let code = l == "ru" ? "ru-RU" : "en-US"
      if supported.contains(code) && !wanted.contains(code) { wanted.append(code) }
    }
    if wanted.isEmpty { request.automaticallyDetectsLanguage = true } else { request.recognitionLanguages = wanted }

    try VNImageRequestHandler(cgImage: cg, orientation: .up, options: [:]).perform([request])

    return (request.results ?? []).compactMap { obs in
      guard let top = obs.topCandidates(1).first, !top.string.trimmingCharacters(in: .whitespaces).isEmpty else { return nil }
      let b = obs.boundingBox // normalised, origin bottom-left
      return ["text": top.string, "x": b.minX, "y": 1 - b.maxY, "w": b.width, "h": b.height]
    }
  }

  private static func tessdata() -> String? {
    let bundles = [Bundle.main, Bundle(for: TextOcrModule.self)]
    for b in bundles {
      if let url = b.url(forResource: "TextOcrData", withExtension: "bundle"), FileManager.default.fileExists(atPath: url.appendingPathComponent("uzb_cyrl.traineddata").path) {
        return url.path
      }
    }
    return nil
  }

  private static func tesseract(_ cg: CGImage, _ langs: [String]) throws -> [[String: Any]] {
    guard let dir = tessdata() else { throw Exception(name: "ERR_OCR_DATA", description: "Tesseract models are missing") }
    var codes: [String] = []
    for l in langs { if let c = tessCodes[l], !codes.contains(c) { codes.append(c) } }
    let w = cg.width, h = cg.height
    // 8-bit grey copy of the page: all Tesseract needs, and no image library to link.
    var pixels = [UInt8](repeating: 0, count: w * h)
    let drawn = pixels.withUnsafeMutableBytes { buf -> Bool in
      guard let ctx = CGContext(data: buf.baseAddress, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w, space: CGColorSpaceCreateDeviceGray(), bitmapInfo: CGImageAlphaInfo.none.rawValue) else { return false }
      ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
      return true
    }
    if !drawn { throw Exception(name: "ERR_OCR_IMAGE", description: "Cannot prepare the image") }

    tessLock.lock()
    defer { tessLock.unlock() }
    guard let api = TessBaseAPICreate() else { throw Exception(name: "ERR_OCR_INIT", description: "Tesseract failed to start") }
    defer { TessBaseAPIDelete(api) }
    if TessBaseAPIInit3(api, dir, codes.joined(separator: "+")) != 0 { throw Exception(name: "ERR_OCR_INIT", description: "Tesseract failed to load the models") }
    TessBaseAPISetPageSegMode(api, PSM_AUTO)
    var out: [[String: Any]] = []
    try pixels.withUnsafeBufferPointer { buf in
      TessBaseAPISetImage(api, buf.baseAddress, Int32(w), Int32(h), 1, Int32(w))
      if TessBaseAPIRecognize(api, nil) != 0 { throw Exception(name: "ERR_OCR_RUN", description: "Tesseract could not read the page") }
      guard let it = TessBaseAPIGetIterator(api) else { return }
      defer { TessResultIteratorDelete(it) }
      guard let page = TessResultIteratorGetPageIterator(it) else { return }
      repeat {
        var l: Int32 = 0, t: Int32 = 0, r: Int32 = 0, b: Int32 = 0
        guard let cstr = TessResultIteratorGetUTF8Text(it, RIL_TEXTLINE) else { continue }
        let text = String(cString: cstr).trimmingCharacters(in: .whitespacesAndNewlines)
        TessDeleteText(cstr)
        if !text.isEmpty, TessPageIteratorBoundingBox(page, RIL_TEXTLINE, &l, &t, &r, &b) != 0, r > l, b > t {
          out.append(["text": text, "x": Double(l) / Double(w), "y": Double(t) / Double(h), "w": Double(r - l) / Double(w), "h": Double(b - t) / Double(h)])
        }
      } while TessPageIteratorNext(page, RIL_TEXTLINE) != 0
    }
    return out
  }
}
