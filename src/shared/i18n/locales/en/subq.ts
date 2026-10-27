// Subscription quote, plan contract and feature limits (TZ.md subscriptions, 402 codes).
export const subq = {
  subq: {
    price: {
      monthly: "UZS / month",
      six_month: "UZS · 6 months",
      yearly: "UZS · 12 months",
      prepaid_yearly: "UZS · 12 months, prepaid",
      failed: "Couldn't get the price",
      off: "−{sum}",
      promo: "Discount",
      until: "until {date}",
    },
    gate: {
      title: {
        feature_limit_exhausted: "Limit reached",
        active_subscription_required: "Subscription needed",
        feature_not_in_plan: "Not in your plan",
        ai_subscription_required: "AI limit reached",
        plan_required: "Plan needed",
      },
      text: {
        feature_limit_exhausted: "Your “{feature}” limit for this period is used up. Wait for the reset or choose a bigger plan.",
        active_subscription_required: "“{feature}” works only with an active subscription. Choose a plan.",
        feature_not_in_plan: "“{feature}” isn't part of your plan. Choose a plan that includes it.",
      },
      any: {
        feature_limit_exhausted: "Your limit for this period is used up. Wait for the reset or choose a bigger plan.",
        active_subscription_required: "You have no active subscription. Choose a plan to continue.",
        feature_not_in_plan: "This isn't part of your plan.",
        ai_subscription_required: "Your overall AI limit is used up. Upgrade your plan to continue.",
        plan_required: "This needs a suitable plan.",
      },
      plans: "Plans",
      open: "See plans",
      none: "Choose a plan with this feature on the plans page.",
      sent: "Request sent. The plan turns on once it's approved.",
      left: "{feature}: {n} left",
    },
    feature: {
      document_constructor: "Document builder",
      ai_document_analysis: "AI document analysis",
    },
    unit: {
      any: "{n}",
      day: "{n, plural, one {# day} other {# days}}",
      document: "{n, plural, one {# document} other {# documents}}",
      request: "{n, plural, one {# request} other {# requests}}",
      download: "{n, plural, one {# download} other {# downloads}}",
      template: "{n, plural, one {# template} other {# templates}}",
    },
    contract: {
      now: "This period's terms",
      next: "New terms",
      nextV: "New terms · version {n}",
      was: "Now: {v}",
      price: "Next payment: {sum}",
    },
  },
};
