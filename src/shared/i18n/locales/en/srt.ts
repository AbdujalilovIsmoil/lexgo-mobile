// Service page runtime configuration (TZ.md §4 Marketplace Review): duration, rules for the client, guarantees, the checklist preview.
export const srt = {
  srt: {
    dur: {
      minute: "{n, plural, one {# minute} other {# minutes}}",
      hour: "{n, plural, one {# hour} other {# hours}}",
      day: "{n, plural, one {# day} other {# days}}",
      bizDay: "{n, plural, one {# business day} other {# business days}}",
      bizTime: "{time} on business days",
    },
    review: {
      title: "Your request is reviewed first",
      time: "Review time: {time}",
      note: "The specialist reviews your request and confirms the delivery time.",
    },
    check: {
      title: "What the specialist will do",
      required: "Required",
    },
    rules: {
      title: "Service rules",
      version: "Version {v}",
      more: "Read more",
      less: "Show less",
    },
    g: {
      title: "Service guarantees",
      when: "When: {text}",
      how: "Resolution: {text}",
      within: "Resolution time: {time}",
    },
    safe: {
      title: "Buying through LexGo",
      fact: "Payment, chat and calls go through LexGo.",
    },
    w: {
      subtitle: "A problem with an order? Send a request here.",
      terms: "A service's guarantees are shown on its page.",
      review: "The decision comes after the request is reviewed.",
      status: "The request status updates in the list below.",
    },
    error: "Couldn't load the service terms.",
  },
};
