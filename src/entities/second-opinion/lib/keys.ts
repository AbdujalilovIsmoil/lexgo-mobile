import type { Placement, PromoEventName, SoChannel } from "../model/types";

// Stable keys: a repeated request with the same key answers with the same event id and is not a failure.
export const eventKey = (orderId: string, placement: Placement, session: string, event: PromoEventName): string =>
  `second-opinion:${orderId}:${placement}:${session}:${event}`;

export const quoteKey = (orderId: string, session: string, channel: SoChannel, count: number): string =>
  `second-opinion:${orderId}:${session}:quote:${channel}:${count}`;
