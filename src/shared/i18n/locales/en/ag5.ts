import type { Messages } from "../uz";

export const ag5: Messages["ag5"] = {
  count: "{n} packages", search: "Name or code", empty: "No packages", emptyText: "Tap + to create a package",
  saved: "Package saved", done: "Done", saves: "saves {n}", parts: "{c} services · {m} milestones",
  create: "New package", edit: "Edit package", formHint: "Services, price and payment milestones",
  components: "Services", addService: "Add a service", pickService: "Pick a service", searchService: "Search services...", noService: "No service found",
  clientPrice: "Client price", sellerFee: "Seller fee", kind: "Kind", packagePrice: "Package price", priceHint: "Left empty, the sum of the services is used",
  milestones: "Payment milestones", criteria: "Acceptance criterion", addMilestone: "Add milestone", included: "Included", excluded: "Not included",
  linesHint: "One per line", refund: "Refund terms", simHint: "The price calculation appears once a service is added",
  version: "Version", region: "Region mode", approvedAt: "Approved", preview: "Client and seller view", previewClient: "Client sees", previewSeller: "Seller sees",
  kinds: { mandatory: "Mandatory", optional: "Optional", choose_one: "Choose one" },
  sim: { price: "Package price", separate: "Separate price", savings: "Savings", seller: "To the seller", lexgo: "LexGo share" },
  act: { edit: "Edit", submit: "Send for approval", approve: "Approve", publish: "Put on sale", stop: "Stop", clone: "Duplicate", self: "Another staff member approves" },
  ask: {
    submit: "{name} will be sent for approval.", approve: "Approve the package {name}?",
    publish: "{name} will go on sale to clients.", stop: "{name} will be taken off sale.",
  },
};
