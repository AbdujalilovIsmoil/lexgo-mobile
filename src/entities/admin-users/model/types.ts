export type UserHit = {
  id: string;
  lexgoId: string;
  name: string;
  phone: string;
  role: string; // primary backend role (client, yurist, advokat, call_center …)
  status: string;
  roles: string[]; // assigned roles (admin list only)
  permissions: string[]; // permission codes (admin list only)
  createdAt: string;
};
