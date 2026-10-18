package org.cognilabs.textocr

import android.graphics.BitmapFactory
import android.net.Uri
import com.googlecode.tesseract.android.TessBaseAPI
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File

// Text recognition with Tesseract (models in assets/tessdata). Returns lines with their position as fractions of the image (origin top-left).
class TextOcrModule : Module() {
  private val lock = Any() // one recognition at a time: the engine is heavy and not shared between calls

  override fun definition() = ModuleDefinition {
    Name("TextOcr")

    AsyncFunction("recognize") { uri: String, langs: List<String> ->
      val path = Uri.parse(uri).path ?: throw IllegalArgumentException("Bad image uri")
      val bitmap = BitmapFactory.decodeFile(path) ?: throw IllegalArgumentException("Cannot read the image")
      val width = bitmap.width
      val height = bitmap.height
      val codes = langs.mapNotNull { CODES[it] }.distinct().ifEmpty { listOf("eng") }
      val root = prepare(codes)
      val lines = ArrayList<Map<String, Any>>()
      synchronized(lock) {
        val api = TessBaseAPI()
        try {
          if (!api.init(root.absolutePath, codes.joinToString("+"))) throw IllegalStateException("Tesseract init failed")
          api.setPageSegMode(TessBaseAPI.PageSegMode.PSM_AUTO)
          api.setImage(bitmap)
          api.getUTF8Text() // runs the recognition
          val it = api.getResultIterator()
          if (it != null) {
            it.begin()
            do {
              val text = it.getUTF8Text(TessBaseAPI.PageIteratorLevel.RIL_TEXTLINE)?.trim().orEmpty()
              val r = it.getBoundingRect(TessBaseAPI.PageIteratorLevel.RIL_TEXTLINE)
              if (text.isNotEmpty() && r.width() > 0 && r.height() > 0) {
                lines.add(mapOf("text" to text, "x" to r.left.toDouble() / width, "y" to r.top.toDouble() / height, "w" to r.width().toDouble() / width, "h" to r.height().toDouble() / height))
              }
            } while (it.next(TessBaseAPI.PageIteratorLevel.RIL_TEXTLINE))
            it.delete()
          }
        } finally {
          api.recycle()
          bitmap.recycle()
        }
      }
      mapOf("width" to width, "height" to height, "lines" to lines)
    }
  }

  // Tesseract wants <dir>/tessdata/<lang>.traineddata on disk: copy the needed models out of the APK once.
  private fun prepare(codes: List<String>): File {
    val ctx = appContext.reactContext ?: throw Exceptions.ReactContextLost()
    val root = File(ctx.filesDir, "ocr")
    val dir = File(root, "tessdata").apply { mkdirs() }
    for (c in codes) {
      val out = File(dir, "$c.traineddata")
      if (out.exists() && out.length() > 0) continue
      val tmp = File(dir, "$c.traineddata.part")
      ctx.assets.open("tessdata/$c.traineddata").use { src -> tmp.outputStream().use { src.copyTo(it) } }
      if (!tmp.renameTo(out)) throw IllegalStateException("Cannot store $c model")
    }
    return root
  }

  companion object {
    private val CODES = mapOf("uz" to "uzb", "uz-cyrl" to "uzb_cyrl", "ru" to "rus", "en" to "eng")
  }
}
