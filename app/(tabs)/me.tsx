import { ProfileTab } from "@/pages/profile/ProfilePage";
import { lazyTab } from "@/widgets/tab-page";

// The client's Profil tab: the same profile page as /profile, without the back button (a tab has nothing to go back to).
export default lazyTab(ProfileTab);
