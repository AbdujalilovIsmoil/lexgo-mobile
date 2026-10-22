const { withAppDelegate, withInfoPlist } = require("expo/config-plugins");

const MARK = "// lexgo-uiscene";
const BG_MARK = "// lexgo-background-start";
const BG_BLOCK = `
    ${BG_MARK}
#if !DEBUG
    // Launched in the background (a data push while the app was closed, a background fetch) no scene connects, so nothing would start
    // React Native — yet those tasks are JavaScript. If no scene has connected a moment after launch, React Native starts without a
    // window; a scene that connects later reuses the same host.
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
      guard let factory = self?.reactNativeFactory, application.connectedScenes.isEmpty, application.applicationState == .background else { return }
      factory.rootViewFactory.initializeReactHost(launchOptions: launchOptions, bundleConfiguration: RCTBundleConfiguration.default(), devMenuConfiguration: RCTDevMenuConfiguration.default())
    }
#endif
`;
const COLOR = "UIColor(red: 3.0 / 255.0, green: 16.0 / 255.0, blue: 43.0 / 255.0, alpha: 1.0)";

// iOS asks every app to adopt the UIScene life cycle ("UIScene lifecycle will soon be required"; iOS 27 asserts at launch without it).
// Expo SDK 57 ships the pieces: the AppDelegate only builds the React Native factory (and says so by conforming to
// ExpoReactNativeFactoryProvider); the window is made and React Native started by the scene delegate (ExpoAppSceneDelegate), which
// Info.plist names under UIApplicationSceneManifest. LexGoSceneDelegate is that class plus the dark (#03102B) window the app paints
// before its JS has loaded (see withDarkWindow). Survives `expo prebuild`; run it after withDarkWindow.
module.exports = function withUIScene(config) {
  config = withAppDelegate(config, (cfg) => {
    if (cfg.modResults.language !== "swift") return cfg;
    let src = cfg.modResults.contents;
    if (src.includes(MARK)) {
      if (!src.includes(BG_MARK)) src = src.replace("started by LexGoSceneDelegate (UIScene life cycle).\n", `started by LexGoSceneDelegate (UIScene life cycle).\n${BG_BLOCK}`);
      cfg.modResults.contents = src;
      return cfg;
    }
    // The window and the React Native start move to the scene delegate.
    src = src.replace(/#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)[\s\S]*?launchOptions: launchOptions\)\n#endif\n\n?/, `${MARK}\n    // The window is created and React Native started by LexGoSceneDelegate (UIScene life cycle).\n${BG_BLOCK}`);
    src = src.replace("class AppDelegate: ExpoAppDelegate {", "class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {");
    src += `
// The scene delegate named in Info.plist (UIApplicationSceneManifest): the window and React Native start come from ExpoAppSceneDelegate.
@objc(LexGoSceneDelegate)
class LexGoSceneDelegate: ExpoAppSceneDelegate {
  override func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
    super.scene(scene, willConnectTo: session, options: connectionOptions)
    window?.backgroundColor = ${COLOR} // lexgo-dark-window
  }
}
`;
    cfg.modResults.contents = src;
    return cfg;
  });
  return withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [{ UISceneConfigurationName: "Default Configuration", UISceneDelegateClassName: "LexGoSceneDelegate" }],
      },
    };
    return cfg;
  });
};
