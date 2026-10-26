import { LoginPage } from "@/pages/login/LoginPage";
import { OverlayHost } from "@/shared/ui";

// A native modal on iOS: the toasts and the confirm dialog are drawn inside it while it is up (behind it otherwise).
export default function Login() {
  return (
    <>
      <LoginPage />
      <OverlayHost />
    </>
  );
}
