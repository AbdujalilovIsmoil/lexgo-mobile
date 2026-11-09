// Loads Reactotron in dev builds only. `require` behind __DEV__ lets the release bundle drop it (an `import` would always be bundled).
if (__DEV__) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("./reactotron");
}

export {};
