import ExpoModulesCore
import UIKit

// Whether the screen is being recorded, mirrored or AirPlayed right now (UIScreen.isCaptured), and when that changes. A call mutes the
// other side's voice while the screen is captured: expo-screen-capture already covers the picture with black, this keeps the voice out
// of the recording as well.
public class ScreenGuardModule: Module {
  private var observer: NSObjectProtocol?

  public func definition() -> ModuleDefinition {
    Name("ScreenGuard")

    Events("onCaptureChange")

    AsyncFunction("isCapturedAsync") { () -> Bool in
      UIScreen.main.isCaptured
    }.runOnQueue(.main)

    OnStartObserving("onCaptureChange") {
      guard self.observer == nil else { return }
      self.observer = NotificationCenter.default.addObserver(forName: UIScreen.capturedDidChangeNotification, object: nil, queue: .main) { [weak self] _ in
        self?.sendEvent("onCaptureChange", ["captured": UIScreen.main.isCaptured])
      }
    }

    OnStopObserving("onCaptureChange") {
      self.stop()
    }

    OnDestroy {
      self.stop()
    }
  }

  private func stop() {
    if let observer {
      NotificationCenter.default.removeObserver(observer)
    }
    observer = nil
  }
}
