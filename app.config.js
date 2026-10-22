const fs = require("fs");

// app.json stays the single source; this only adds what depends on files that are not in git.
// Android push (FCM) needs Firebase's google-services.json: put it in the project root, or point GOOGLE_SERVICES_JSON at it
// (an EAS "file" environment variable gives a path). Without it the build still works — it just gets no FCM token.
module.exports = ({ config }) => {
  const file = process.env.GOOGLE_SERVICES_JSON || "./google-services.json";
  if (!fs.existsSync(file)) return config;
  return { ...config, android: { ...config.android, googleServicesFile: file } };
};
