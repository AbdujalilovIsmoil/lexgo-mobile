const appJson = require("./app.json");

// LEXGO_PERSONAL_TEAM=1 → build without the paid-only capabilities (see
// plugins/withPersonalTeam.js). The plugin is listed first so its mod runs last.
module.exports = () => {
  const config = appJson.expo;
  if (process.env.LEXGO_PERSONAL_TEAM !== "1") return config;
  const { associatedDomains: _omit, ...ios } = config.ios;
  return {
    ...config,
    ios: { ...ios, appleTeamId: "UWT4C7T59B" },
    plugins: ["./plugins/withPersonalTeam", ...config.plugins],
  };
};
