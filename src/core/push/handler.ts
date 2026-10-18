import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import { localPrefs } from "@/entities/notification";

// How the OS treats a notification that arrives while the app is running. In the foreground the app
// draws its own banner from the realtime event (and skips screens the event is about), so the OS
// stays quiet; in the background it shows normally. Module scope: set once, before anything fires.
Notifications.setNotificationHandler({
  handleNotification: async () => {
    const foreground = AppState.currentState === "active";
    return { shouldShowBanner: !foreground, shouldShowList: !foreground, shouldPlaySound: !foreground && localPrefs().sound, shouldSetBadge: false };
  },
});
