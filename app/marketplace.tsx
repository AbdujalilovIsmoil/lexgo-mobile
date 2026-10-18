import { Redirect, useLocalSearchParams } from "expo-router";

// /marketplace is the directory's stack-level address (links from other roles, push
// notifications, Home chips). It lands on the Lawyers tab and keeps ?q=&area=&region=&service=&ai=.
export default function Marketplace() {
  const params = useLocalSearchParams<Record<string, string>>();
  return <Redirect href={{ pathname: "/(tabs)/lawyers", params }} />;
}
