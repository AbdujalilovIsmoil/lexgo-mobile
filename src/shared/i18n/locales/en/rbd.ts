import type { Messages } from "../uz";

// The seller rating breakdown (the web's marketplace.ratingBreakdown).
export const rbd: Messages["rbd"] = {
  "title": "How the rating is made",
  "titleMine": "Your rating",
  "lead": "Only paid, completed services count; each factor is scored out of 100.",
  "leadMine": "Your rating counts only real, paid and completed services. Lift the weaker factors to rise in the list.",
  "reviews": "{n, plural, one {# review} other {# reviews}}",
  "unrated": "Not rated yet",
  "unratedWhy": "Not enough real reviews yet",
  "ranking": "Ranking score",
  "factor": {
    "client_reviews": "Client reviews",
    "completion_rate": "Completed orders",
    "acceptance_rate": "Acceptance rate",
    "response_score": "Response speed",
    "verified_experience": "Verified experience",
    "sla": "Deadlines kept",
    "complaints": "Upheld complaints",
    "cancellations": "Cancellations and no-answers"
  },
  "hint": {
    "client_reviews": "Client reviews after paid services",
    "completion_rate": "How many started orders were completed",
    "acceptance_rate": "How many orders sent to you were accepted",
    "response_score": "How fast you answer a new order",
    "verified_experience": "Category experience verified by the call center"
  },
  "completed": "Completed orders",
  "ofN": "{n} / {of}",
  "response": "Average response time",
  "minutes": "{n} min",
  "hours": "{n} h",
  "experience": "Verified experience",
  "years": "{n} yr",
  "noExperience": "Not verified yet",
  "calculatedAt": "Calculated {date}",
  "policy": "Rating rules v{n}",
  "weight": "weight {n}%",
  "coldStart": "Until you have enough reviews, the “Client reviews” share is scored from the other factors — complete your first orders on time and well.",
  "penalties": "Penalties",
  "noPenalties": "No penalties — no upheld complaints or refunds.",
  "penComplaints": "Upheld complaints: {n}",
  "penRefunds": "Refunds: {n}",
  "fold": "{score} points · {reviews}"
};
