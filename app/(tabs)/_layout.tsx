import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#e8ab55" },
        headerTitleStyle: { color: "white" },
        headerTintColor: "white",

        tabBarStyle: { backgroundColor: "#e8ab55",height: 60 + insets.bottom,paddingTop: 6,paddingBottom: insets.bottom > 0 ? insets.bottom : 8,},
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "#ffffffaa",
      }}
    >
      <Tabs.Screen name="home" options={{title: "Home",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen name="notice" options={{title: "Notice",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="bell-o" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen name="myTask" options={{title: "My Tasks",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="check-square-o" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen name="settings" options={{title: "Settings",
          tabBarIcon: ({ color, size }) => ( <FontAwesome name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
