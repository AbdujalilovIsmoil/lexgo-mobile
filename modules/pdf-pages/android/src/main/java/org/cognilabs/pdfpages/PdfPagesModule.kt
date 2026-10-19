package org.cognilabs.pdfpages

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.ParcelFileDescriptor
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileOutputStream

// PDF pages as images (android.graphics.pdf.PdfRenderer). Pages are written as JPEG files under cache/lexgo-files/pdf-pages,
// which is wiped together with the downloaded documents on logout.
class PdfPagesModule : Module() {
  private val lock = Any() // PdfRenderer allows one open page at a time

  override fun definition() = ModuleDefinition {
    Name("PdfPages")

    AsyncFunction("pageCount") { uri: String ->
      val file = localFile(uri)
      synchronized(lock) { open(file) { r -> r.pageCount } }
    }

    AsyncFunction("renderPage") { uri: String, index: Int, width: Int ->
      val file = localFile(uri)
      val target = width.coerceIn(200, 3000)
      val out = File(cacheDir(), "${(file.absolutePath + file.lastModified() + file.length()).hashCode().toUInt()}-$index-$target.jpg")
      synchronized(lock) {
        open(file) { r ->
          if (index < 0 || index >= r.pageCount) throw IllegalArgumentException("Page out of range")
          r.openPage(index).use { page ->
            // PDF page size is in 1/72 inch; scale to the requested width and cap the height so a huge page cannot exhaust memory.
            var w = target
            var h = (target.toDouble() * page.height / page.width).toInt().coerceAtLeast(1)
            if (h > 6000) { w = (w.toDouble() * 6000 / h).toInt().coerceAtLeast(1); h = 6000 }
            if (!out.exists()) {
              val bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
              try {
                Canvas(bmp).drawColor(Color.WHITE) // pages are transparent by default
                page.render(bmp, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
                FileOutputStream(out).use { bmp.compress(Bitmap.CompressFormat.JPEG, 90, it) }
              } finally {
                bmp.recycle()
              }
            }
            mapOf("uri" to Uri.fromFile(out).toString(), "width" to w, "height" to h)
          }
        }
      }
    }
  }

  private fun localFile(uri: String): File {
    val path = Uri.parse(uri).path ?: throw IllegalArgumentException("Bad pdf uri")
    val f = File(path)
    if (!f.isFile) throw IllegalArgumentException("PDF file not found")
    return f
  }

  private fun cacheDir(): File {
    val ctx = appContext.reactContext ?: throw Exceptions.ReactContextLost()
    return File(ctx.cacheDir, "lexgo-files/pdf-pages").also { it.mkdirs() }
  }

  private inline fun <T> open(file: File, block: (PdfRenderer) -> T): T {
    val fd = ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY)
    val renderer = try { PdfRenderer(fd) } catch (e: Exception) { fd.close(); throw e } // password-protected / damaged files throw here
    return try { block(renderer) } finally { renderer.close(); fd.close() }
  }
}
