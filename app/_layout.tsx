import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, router, usePathname } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function RootLayout() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // listen for login state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload();

        const verified = user.emailVerified === true;
        const onVerifyPage = pathname === "/auth/verifyEmail";
        const onAuthPages = pathname?.startsWith("/auth");

        if (!verified && !onVerifyPage) {// if logged in but email not verified  force verify screen
          router.replace("/auth/verifyEmail");
          return;
        }

        if (verified && onVerifyPage) {// if user verifies email while on verify page send to home
          router.replace("/(tabs)/home");
          return;
        }

        if (verified && onAuthPages && !onVerifyPage) { // if user is already logged in and tries to open login/signup
          router.replace("/(tabs)/home");
          return;
        }
      }

      setReady(true);
    });

    return () => unsubscribe();
  }, [pathname]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}