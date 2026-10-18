import type { Messages } from "../uz";

export const admOtp: Messages["admOtp"] = {
  lead: "Только для staging/demo. OTP-коды больше не возвращаются в ответах — смотрите здесь.",
  tapHint: "Нажмите на код, чтобы скопировать.",
  empty: "Пока нет тестовых OTP",
  stagingOnly: "Только в staging-среде",
  stagingOnlyText: "Тестовые OTP-коды хранятся только на staging/demo-сервере. На production этого списка нет — коды приходят по SMS или в Telegram.",
};
