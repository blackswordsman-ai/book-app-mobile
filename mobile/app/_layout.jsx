import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "@/components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/store/authStore";



export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
 
  const{user,token,checkAuth} = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [ ]);

  // handle the navigation based on the user authentication
  
  useEffect(() => {
    if (!segments || segments.length === 0) return;
    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = !!user && !!token;
    if (!inAuthScreen && !isSignedIn) router.replace("/(auth)");
    else if (inAuthScreen && isSignedIn) router.replace("/(tabs)");
  }, [user, token, segments]);

  
  return (
    <SafeAreaProvider>
      <SafeScreen>
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
   
      </Stack>
      <StatusBar style="dark" />
      </SafeScreen>
      
    </SafeAreaProvider>
  );
}
