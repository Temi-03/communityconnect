import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#e09020b7" },
        headerTitleStyle: { color: "white" },
        headerTintColor: "white",

        tabBarStyle: { backgroundColor: "#e09020b7" },
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
