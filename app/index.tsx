import { Redirect } from "expo-router";
import {auth} from "../firebase";

export default function Index() {
  const user = auth.currentUser;
  if(user&& !user.emailVerified){
    return <Redirect href="/auth/verifyEmail" />;
  }
  if(user&& user.emailVerified )
    {
      return <Redirect href="/(tabs)/home" />;
    }

    return <Redirect href="/entry" />; //sends to welcome
  

}