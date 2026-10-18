export type ReqKind = "docs" | "urgent" | "orders" | "meetings" | "pool";

// One incoming/assigned piece of work, whatever module it comes from.
export type ReqItem = {
  kind: ReqKind;
  id: string;
  title: string;
  client: string;
  detail: string; // document type · urgent channel (chat/audio/video) · call type
  amount: number; // marketplace price in so'm (0 elsewhere)
  when: string; // scheduled time (ISO) of a Tezkor meeting, else ""
  status: string;
  at: string; // ISO timestamp used for ordering / "x ago"
  route: string; // where tapping it goes (the owning package's screen)
  action: boolean; // needs the professional's attention now (also drives the tab badge)
  active: boolean; // not finished / cancelled
};
