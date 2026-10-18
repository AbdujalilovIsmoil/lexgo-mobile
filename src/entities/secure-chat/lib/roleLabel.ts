// Backend role words (participant.role and message.sender.role) → ms4.role.<key>.
const KEY: Record<string, string> = {
  client: "client",
  seller: "seller",
  lawyer: "advokat",
  advokat: "advokat",
  advokat_tashkiloti: "advokat",
  group_lawyer: "groupLawyer",
  yurist: "yurist",
  call_center: "duty",
  call_center_lawyer: "duty",
  operator: "operator",
  admin: "operator",
  superadmin: "operator",
};

/** i18n key of a role chip, or "" for a role we have no wording for (never guess a label). */
export const roleKey = (role: string): string => {
  const k = KEY[role.trim().toLowerCase()];
  return k ? `ms4.role.${k}` : "";
};
