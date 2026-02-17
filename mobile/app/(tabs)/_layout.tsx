import { FontAwesome5 } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout(){
  return (
    <Tabs screenOptions={{
      headerShown:false
    }}>
      <Tabs.Screen name="home"
      options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={size} color={color} />
          ),
        }}/>
    </Tabs>
  )
}
