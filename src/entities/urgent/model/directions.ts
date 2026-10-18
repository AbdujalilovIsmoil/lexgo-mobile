// Practice areas as the backend stores them (Uzbek slugs). The client form offers the first seven.
export const DIRECTIONS = ["jinoiy", "fuqarolik", "oila", "mehnat", "mamuriy", "iqtisodiy", "soliq"] as const;
export const STAFF_DIRECTIONS = [...DIRECTIONS, "shartnoma"] as const;
export const KINDS = ["video_consultation", "express_video_consultation", "traffic_accident_consultation", "chat_consultation", "second_opinion_single", "second_opinion_group"] as const;
export const STATUSES = ["open_pool", "claimed", "scheduled", "in_progress", "meeting_active", "completed", "cancelled"] as const;
