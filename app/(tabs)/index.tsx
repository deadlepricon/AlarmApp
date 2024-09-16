// app/index.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  ListRenderItem,
} from "react-native";
import DateDisplay from "@/components/DateDisplay";
import Clock from "@/components/Clock";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Swipeable } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Switch } from "react-native";

interface Alarm {
  id: string;
  time: string; // ISO string representation of the scheduled time
  status: boolean;
}

export default function Home() {
  const router = useRouter();
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  const fetchAlarms = async () => {
    try {
      const storedAlarms = await AsyncStorage.getItem("alarms");
      const alarms = storedAlarms ? JSON.parse(storedAlarms) : [];
      setAlarms(alarms);
    } catch (error) {
      console.error("Error loading alarms:", error);
    }
  };

  // Fetch alarms when the component mounts
  useEffect(() => {
    fetchAlarms();
  }, []);

  // Re-fetch alarms when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchAlarms();
    }, [])
  );

  const colors = ["#9d00ff", "#FFA500", "#6bff00"]; // Purple, Orange, Green
  const gradients = [
    ["#8A2BE2", "#4B0082"], // Gradient from Purple to Indigo
    ["#FFA500", "#FF6347"], // Gradient from Orange to Tomato
    ["#32CD32", "#228B22"], // Gradient from LimeGreen to ForestGreen
  ];

  const renderAlarmItem: ListRenderItem<Alarm> = ({ item, index }) => {
    const alarmDate = new Date(item.time);
    const timeString = alarmDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const toggleAlarmStatus = async () => {
      try {
        const updatedAlarms = alarms.map((alarm) =>
          alarm.id === item.id ? { ...alarm, status: !alarm.status } : alarm
        );
        await AsyncStorage.setItem("alarms", JSON.stringify(updatedAlarms));
        setAlarms(updatedAlarms);
      } catch (error) {
        console.error("Error updating alarm status:", error);
      }
    };

    const deleteAlarm = async () => {
      await Notifications.cancelScheduledNotificationAsync(item.id);
      try {
        const storedAlarms = await AsyncStorage.getItem("alarms");
        const alarms = storedAlarms ? JSON.parse(storedAlarms) : [];
        const updatedAlarms = alarms.filter(
          (alarm: Alarm) => alarm.id !== item.id
        );
        await AsyncStorage.setItem("alarms", JSON.stringify(updatedAlarms));
        setAlarms(updatedAlarms);
      } catch (error) {
        console.error("Error deleting alarm:", error);
      }
    };

    const renderRightActions = () => (
      <TouchableOpacity
        onPress={deleteAlarm}
        style={styles.deleteButtonContainer}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    );

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <LinearGradient
          colors={gradients[index % gradients.length]} // Set gradient colors based on index
          style={styles.gradientContainer}
        >
          <View style={styles.alarmItem}>
            <Text style={styles.alarmText}>{timeString}</Text>
            <Switch
              value={item.status}
              onValueChange={toggleAlarmStatus}
              trackColor={{ false: "#767577", true: "#767577" }}
              thumbColor={
                item.status ? colors[index % colors.length] : "#f4f3f4"
              }
            />
          </View>
        </LinearGradient>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.datetimeContainer}>
        <DateDisplay />
        <Clock />
      </View>

      <LinearGradient
        colors={["#6e00b3", "#9d00ff", "#6e00b3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        <TouchableOpacity
          onPress={() => router.push("addAlarm")}
          style={styles.touchableArea}
        >
          <Text style={styles.buttonText}>New Alarm</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.alarmListContainer}>
        <Text style={styles.alarmListTitle}>Scheduled Alarms:</Text>
        <FlatList
          data={alarms}
          keyExtractor={(item) => item.id}
          renderItem={renderAlarmItem}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  // ... existing styles ...
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
    backgroundColor: "#16161d",
  },
  datetimeContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  button: {
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 20,
  },
  touchableArea: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  alarmListContainer: {
    marginTop: 20,
    width: "80%",
  },
  alarmListTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
  },
  alarmItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderRadius: 20,
  },
  alarmText: {
    fontSize: 18,
    color: "white",
  },
  deleteButton: {
    backgroundColor: "#FF4500",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  deleteButtonContainer: {
    backgroundColor: "#FF4500",
    justifyContent: "center",
    alignItems: "flex-start",
    width: 90,
    height: 53,
    // Ensure the delete button covers the full height of the item
    marginVertical: 5,
    borderRadius: 20,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    paddingHorizontal: 20,
  },
  gradientContainer: {
    borderRadius: 20,
    marginVertical: 5,
    overflow: "hidden",
  },
});
