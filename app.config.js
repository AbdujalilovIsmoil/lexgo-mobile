const fs = require("fs");
const { withAndroidManifest, withEntitlementsPlist } = require("expo/config-plugins");

// app.json stays the single source; this only adds what depends on files / accounts that are not in git.
module.exports = ({ config }) => {
  let out = config;

  // Android push (FCM) needs Firebase's google-services.json: put it in the project root, or point GOOGLE_SERVICES_JSON at it
  // (an EAS "file" environment variable gives a path). Without it the build still works — it just gets no FCM token.
  const file = process.env.GOOGLE_SERVICES_JSON || "./google-services.json";
  if (fs.existsSync(file)) out = { ...out, android: { ...out.android, googleServicesFile: file } };

  // Other apps may not record this app's sound ("audio playback capture" of screen recorders): a call's voices stay out of a recording.
  out = withAndroidManifest(out, (cfg) => {
    const app = cfg.modResults.manifest.application?.[0];
    if (app) app.$["android:allowAudioPlaybackCapture"] = "false";
    return cfg;
  });

  // A phone plugged in by USB with a free Apple account ("Personal Team"): that account has no Push Notifications and no Associated Domains
  // capability, so signing fails ("requires a development team" / "doesn't support …") unless both entitlements are left out. Use
  //   IOS_PERSONAL_TEAM=<team id> npx expo prebuild --platform ios --clean   (then build from Xcode or `expo run:ios --device`)
  // Remote push and universal links do not work in that build; a paid team / EAS build is unaffected (the variable is simply not set).
  const team = (process.env.IOS_PERSONAL_TEAM || "").trim();
  if (team) {
    out = { ...out, ios: { ...out.ios, appleTeamId: team, associatedDomains: undefined } };
    out = withEntitlementsPlist(out, (cfg) => {
      delete cfg.modResults["aps-environment"];
      delete cfg.modResults["com.apple.developer.associated-domains"];
      return cfg;
    });
  }
  return out;
};
