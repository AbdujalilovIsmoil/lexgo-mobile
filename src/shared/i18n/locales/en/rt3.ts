// Rating v3: the public rating and the seller's own rating (Marketplace Enterprise contract §19).
export const rt3 = {
  rt3: {
    title: "My rating",
    unrated: "Not rated yet",
    reviews: "{n, plural, one {# review} other {# reviews}}",
    lead: "The rating is made of client reviews (45%), completed orders (15%), response speed (10%), acceptance rate (10%), verified experience (15%) and verified achievements (5%). Upheld complaints and refunds lower it.",
    c: {
      client_reviews: "Client reviews",
      completion_rate: "Completed orders",
      response_score: "Response speed",
      acceptance_rate: "Acceptance rate",
      verified_experience: "Verified experience",
      verified_achievements: "Verified achievements",
    },
    m: {
      completed: "Completed orders",
      terminal: "Closed orders",
      response: "Average response time",
      experience: "Verified experience",
    },
    minutes: "{n} min",
    years: "{n} yr",
    calculated: "Calculated {date}",
    policy: "Rules v{v}",
    failed: "Could not load the rating",
  },
};
