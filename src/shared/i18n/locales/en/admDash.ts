import type { Messages } from "../uz";

export const admDash: Messages["admDash"] = {
  hi: "Welcome, {name}",
  empty: "No dashboard data yet",
  filter: { region: "Region", allRegions: "All regions", demo: "Demo", regionNote: "Region and period are sent to the server. Metrics the server does not filter are marked; trends are cut to the period in the app." },
  demo: { banner: "No real activity yet — demo figures are shown. Real data appears automatically once the first lead, order or payment exists.", forced: "Demo mode is on: sample figures are shown instead of real data. Tap “Demo” to switch it off." },
  hint: { regionNa: "the region filter does not apply to this metric", dateNa: "the date filter does not apply to this metric" },
  units: { mln: "M", mlrd: "B" },
  role: { yurist: "Lawyers", advokat: "Advocates", advokat_tashkiloti: "Advocate organizations", client: "Clients" },
  region: {
    tashkent: "Tashkent city",
    samarkand: "Samarkand",
    fergana: "Fergana",
    bukhara: "Bukhara",
    namangan: "Namangan",
    andijan: "Andijan",
    kashkadarya: "Kashkadarya",
    khorezm: "Khorezm",
    jizzakh: "Jizzakh",
    navoi: "Navoi",
  },
};
