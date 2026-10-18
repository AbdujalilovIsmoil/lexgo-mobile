export type MarketInput = {
  lawyerUserId: string; serviceId?: string; packageId?: string; ids?: string[]; note: string; channel: string; time: string;
};

// POST …/assist/marketplace-purchase-request: EXACTLY ONE of service_id / package_id (TZ 9) - anything else is a bug here.
export function marketBody(i: MarketInput): Record<string, unknown> {
  const svc = (i.serviceId ?? "").trim();
  const pkg = (i.packageId ?? "").trim();
  if (!!svc === !!pkg) throw new Error("market_target");
  const body: Record<string, unknown> = { lawyer_user_id: i.lawyerUserId, selected_option_ids: i.ids ?? [], note: i.note.trim() };
  if (svc) body.service_id = svc;
  else body.package_id = pkg;
  if (i.channel) body.preferred_channel = i.channel;
  if (i.time.trim()) body.preferred_time = i.time.trim();
  return body;
}
