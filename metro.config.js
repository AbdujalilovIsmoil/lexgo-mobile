// Metro config: Expo defaults plus one dev-only endpoint, /__host_clipboard.
//
// The iOS simulator does not always receive the Mac's clipboard (DeviceHub's
// pasteboard sync can stall), so Cmd+V pastes nothing. The app, in dev only,
// asks this endpoint for the Mac clipboard and copies it into the simulator's
// own pasteboard (src/core/dev/useHostClipboardSync.ts).
//
// Safety: macOS only, answers only a connection that comes from this machine
// (loopback) with a loopback Host header (so a web page cannot read it through
// DNS rebinding), text only, capped in size, never cached. It does not exist
// in a production bundle: Metro is a development server.
const { getDefaultConfig } = require("expo/metro-config");
const { execFile } = require("child_process");

const LOOPBACK = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);
const LOCAL_HOST = /^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/i;
const MAX_CHARS = 100000;

function hostClipboard(req, res) {
  const local = LOOPBACK.has(req.socket.remoteAddress) && LOCAL_HOST.test(req.headers.host || "");
  if (!local || process.platform !== "darwin") {
    res.statusCode = 403;
    return res.end();
  }
  execFile("/usr/bin/pbpaste", { encoding: "utf8", maxBuffer: 4 * MAX_CHARS }, (err, out) => {
    res.statusCode = err ? 500 : 200;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(err ? "" : out.slice(0, MAX_CHARS));
  });
}

const config = getDefaultConfig(__dirname);
// The robot mascot (assets/robot): a .glb model that the WebView scene loads.
config.resolver.assetExts = [...config.resolver.assetExts, "glb"];
const enhance = config.server && config.server.enhanceMiddleware;
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    const base = enhance ? enhance(middleware, server) : middleware;
    return (req, res, next) => (req.url && req.url.startsWith("/__host_clipboard") ? hostClipboard(req, res) : base(req, res, next));
  },
};

module.exports = config;
