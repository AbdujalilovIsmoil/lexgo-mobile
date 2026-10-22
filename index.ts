// The app's entry. Background work is defined here, before anything renders: the OS can start the app without a screen just to run
// it (a data push while the app is closed, the periodic background check), and then only the imports of this file run.
import "./src/core/push/task";
import "./src/core/push/remote";

// Expo Router's own entry comes last (docs: "Custom entry point to initialize and load side-effects").
import "expo-router/entry";
