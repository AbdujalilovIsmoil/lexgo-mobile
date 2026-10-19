import ExpoModulesCore
import PDFKit
import UIKit

// PDF pages as images (PDFKit). Pages are written as JPEG files under Caches/lexgo-files/pdf-pages,
// which is wiped together with the downloaded documents on logout.
public class PdfPagesModule: Module {
  public func definition() -> ModuleDefinition {
    Name("PdfPages")

    AsyncFunction("pageCount") { (uri: String) -> Int in
      try Self.document(uri).pageCount
    }

    AsyncFunction("renderPage") { (uri: String, index: Int, width: Int) -> [String: Any] in
      let doc = try Self.document(uri)
      guard index >= 0, index < doc.pageCount, let page = doc.page(at: index), let pageRef = page.pageRef else {
        throw Exception(name: "ERR_PDF_PAGE", description: "Page out of range")
      }
      let target = CGFloat(min(max(width, 200), 3000))
      let box = page.bounds(for: .mediaBox)
      let rotated = page.rotation % 180 != 0
      let pw = rotated ? box.height : box.width
      let ph = rotated ? box.width : box.height
      guard pw > 0, ph > 0 else { throw Exception(name: "ERR_PDF_PAGE", description: "Empty page") }
      var w = target
      var h = (target * ph / pw).rounded()
      if h > 6000 { w = (w * 6000 / h).rounded(); h = 6000 }
      let size = CGSize(width: w, height: max(h, 1))

      let dir = try Self.cacheDir()
      let attrs = try? FileManager.default.attributesOfItem(atPath: try Self.path(uri))
      let stamp = "\(attrs?[.size] ?? 0)-\(((attrs?[.modificationDate] as? Date)?.timeIntervalSince1970) ?? 0)"
      let key = Self.stableHash(try Self.path(uri) + stamp)
      let out = dir.appendingPathComponent("\(key)-\(index)-\(Int(target)).jpg")
      if !FileManager.default.fileExists(atPath: out.path) {
        let format = UIGraphicsImageRendererFormat.default()
        format.scale = 1
        format.opaque = true
        let image = UIGraphicsImageRenderer(size: size, format: format).image { ctx in
          UIColor.white.setFill()
          ctx.fill(CGRect(origin: .zero, size: size))
          // UIKit's context has its origin top-left, PDF space bottom-left: flip, then fit the media box (rotation included) into the bitmap.
          let cg = ctx.cgContext
          cg.translateBy(x: 0, y: size.height)
          cg.scaleBy(x: 1, y: -1)
          cg.concatenate(pageRef.getDrawingTransform(.mediaBox, rect: CGRect(origin: .zero, size: size), rotate: 0, preserveAspectRatio: true))
          cg.drawPDFPage(pageRef)
        }
        guard let data = image.jpegData(compressionQuality: 0.9) else {
          throw Exception(name: "ERR_PDF_RENDER", description: "Cannot encode the page")
        }
        try data.write(to: out, options: .atomic)
      }
      return ["uri": out.absoluteString, "width": Int(size.width), "height": Int(size.height)]
    }
  }

  // hashValue is randomised per launch; the cache key has to survive restarts.
  private static func stableHash(_ s: String) -> UInt64 {
    var h: UInt64 = 5381
    for b in s.utf8 { h = (h &* 33) &+ UInt64(b) }
    return h
  }

  private static func path(_ uri: String) throws -> String {
    guard let url = URL(string: uri), url.isFileURL else { throw Exception(name: "ERR_PDF_URI", description: "Bad pdf uri") }
    return url.path
  }

  private static func document(_ uri: String) throws -> PDFDocument {
    guard let doc = PDFDocument(url: URL(fileURLWithPath: try path(uri))) else {
      throw Exception(name: "ERR_PDF_OPEN", description: "Cannot open the PDF")
    }
    if doc.isLocked { throw Exception(name: "ERR_PDF_LOCKED", description: "The PDF is password protected") }
    return doc
  }

  private static func cacheDir() throws -> URL {
    let base = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
    let dir = base.appendingPathComponent("lexgo-files/pdf-pages", isDirectory: true)
    try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
    return dir
  }
}
