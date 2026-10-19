const { withEntitlementsPlist } = require("expo/config-plugins");

// A free "Personal Team" Apple account cannot sign Push Notifications or
// Associated Domains. With LEXGO_PERSONAL_TEAM=1 these entitlements are dropped
// so the app can be run on a device from Xcode. Normal/EAS builds are untouched.
module.exports = function withPersonalTeam(config) {
  if (process.env.LEXGO_PERSONAL_TEAM !== "1") return config;
  return withEntitlementsPlist(config, (cfg) => {
    delete cfg.modResults["aps-environment"];
    delete cfg.modResults["com.apple.developer.associated-domains"];
    return cfg;
  });
};
