// Rated only when the backend says so: `rating_status` "rated" and a rating above 0. A payload without a status counts five reviews
// as a real rating (the web's rule). An unrated seller is shown as "not rated yet", never as 5.0 (contract §19: `rating_status` "unrated" wins over any number the payload carries).
export const isRated = (status: string, rating: number, reviews: number): boolean => (status.trim() ? status.trim().toLowerCase() === "rated" && rating > 0 : reviews >= 5 && rating > 0);
