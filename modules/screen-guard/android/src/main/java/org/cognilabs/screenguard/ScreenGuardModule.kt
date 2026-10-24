package org.cognilabs.screenguard

import android.os.Build
import android.view.WindowManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.function.Consumer

// Whether this app's window is visible in a screen recording right now (Android 15+: WindowManager's screen-recording callback), and
// when that changes. A call mutes the other side's voice while it is recorded. Older Android versions report false: FLAG_SECURE from
// expo-screen-capture already turns the recording black there, and the call audio (voice communication) cannot be captured by other apps.
class ScreenGuardModule : Module() {
  @Volatile private var recorded = false
  private var callback: Consumer<Int>? = null

  override fun definition() = ModuleDefinition {
    Name("ScreenGuard")

    Events("onCaptureChange")

    AsyncFunction("isCapturedAsync") {
      recorded
    }

    OnStartObserving("onCaptureChange") {
      start()
    }

    OnStopObserving("onCaptureChange") {
      stop()
    }

    OnDestroy {
      stop()
    }
  }

  private fun start() {
    if (Build.VERSION.SDK_INT < 35 || callback != null) return
    val activity = appContext.currentActivity ?: return
    val cb = Consumer<Int> { state ->
      recorded = state == WindowManager.SCREEN_RECORDING_STATE_VISIBLE
      sendEvent("onCaptureChange", mapOf("captured" to recorded))
    }
    try {
      val initial = activity.windowManager.addScreenRecordingCallback(activity.mainExecutor, cb)
      recorded = initial == WindowManager.SCREEN_RECORDING_STATE_VISIBLE
      callback = cb
    } catch (_: SecurityException) {
      // the permission is missing from this build: nothing to report
    }
  }

  private fun stop() {
    val cb = callback ?: return
    callback = null
    if (Build.VERSION.SDK_INT >= 35) {
      try {
        appContext.currentActivity?.windowManager?.removeScreenRecordingCallback(cb)
      } catch (_: RuntimeException) {
      }
    }
  }
}
