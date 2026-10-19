import { RegisterPage } from "@/pages";
import { OverlayHost } from "@/shared/ui";

// A native modal on iOS: the toasts and the confirm dialog are drawn inside it while it is up (behind it otherwise).
export default function Register() {
  return (
    <>
      <RegisterPage />
      <OverlayHost />
    </>
  );
}
