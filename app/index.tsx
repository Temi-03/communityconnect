import { Redirect } from "expo-router";
import { auth } from "../firebase";

export default function Index() {
  //Check current user from firebase
  const user = auth.currentUser;

  //user not verified send to get verified
  if (user && !user.emailVerified) {
    return <Redirect href="/auth/verifyEmail" />;
  }

  //user verified send to home
  if (user && user.emailVerified) {
    return <Redirect href="/(tabs)/home" />;
  }

  //if both condition fail send to entry
  return <Redirect href="/entry" />; //sends to welcome
}
