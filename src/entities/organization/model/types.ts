export type Organization = {
  id: string;
  name: string;
  type: string;
  phone: string;
  inn: string;
  region: string;
  address: string;
  verification: string;
  ownerUserId: string;
  createdAt: string;
};

export type OrgInput = { name: string; phone: string; inn: string; region: string; address: string };

// One row of GET /organizations/{id}/members (the membership itself, no profile).
export type Membership = { id: string; userId: string; title: string; status: string; createdAt: string };

// A seller that can be invited (GET /lawyers directory).
export type Candidate = { userId: string; name: string; kind: string; region: string; verification: string; rating: number; reviews: number };
