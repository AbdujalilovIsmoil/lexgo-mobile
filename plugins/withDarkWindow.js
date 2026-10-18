const { withAppDelegate } = require("expo/config-plugins");

const COLOR = "UIColor(red: 3.0 / 255.0, green: 16.0 / 255.0, blue: 43.0 / 255.0, alpha: 1.0)";
const WINDOW_MARK = "// lexgo-dark-window";
const ROOT_MARK = "// lexgo-dark-root";

// Paints the iOS window AND every React root view dark (#03102B). React Native
// gives the root view the system (white) background until JS finishes loading,
// which flashed white before the animated splash. The factory configuration is
// reused each time the root view is (re)created, so dev-client reloads are
// covered too. Survives `expo prebuild`.
module.exports = function withDarkWindow(config) {
  return withAppDelegate(config, (cfg) => {
    if (cfg.modResults.language !== "swift") return cfg;
    let src = cfg.modResults.contents;
    if (!src.includes(WINDOW_MARK)) {
      src = src.replace(
        "window = UIWindow(frame: UIScreen.main.bounds)",
        `window = UIWindow(frame: UIScreen.main.bounds)\n    window?.backgroundColor = ${COLOR} ${WINDOW_MARK}`,
      );
    }
    if (!src.includes(ROOT_MARK)) {
      src = src.replace(
        "reactNativeFactory = factory\n",
        `reactNativeFactory = factory\n\n    ${ROOT_MARK}\n    if let rootConfig = factory.rootViewFactory.value(forKey: "_configuration") as? RCTRootViewFactoryConfiguration {\n      rootConfig.customizeRootView = { rootView in\n        rootView.backgroundColor = ${COLOR}\n      }\n    }\n`,
      );
    }
    cfg.modResults.contents = src;
    return cfg;
  });
};
