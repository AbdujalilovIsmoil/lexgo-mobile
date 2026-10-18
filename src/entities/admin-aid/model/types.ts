export type AidRequest = {
  id: string;
  workId: string;
  title: string;
  status: string;
  name: string;
  phone: string;
  details: string;
  createdAt: string;
};

export type AidDetail = {
  request: AidRequest;
  source: string;
  event: string;
  createdByName: string;
  createdByUserId: string;
  explanation: string;
};
