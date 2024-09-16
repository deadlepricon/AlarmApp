import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddAlarm() {
  const [time, setTime] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Request permissions on mount
    Notifications.requestPermissionsAsync();
  }, []);

  const onChange = (
    event: DateTimePickerEvent,
    selectedTime?: Date | undefined
  ) => {
    setShowPicker(true);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const showTimePicker = () => {
    setShowPicker(true);
  };

  const scheduleAlarm = async () => {
    const now = new Date();
    let triggerTime = new Date(time);

    // If the selected time is before now, schedule for the next day
    if (triggerTime <= now) {
      triggerTime.setDate(triggerTime.getDate() + 1);
    }

    const schedulingOptions = {
      content: {
        title: "Alarm",
        body: "Your alarm is ringing!",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        year: triggerTime.getFullYear(),
        month: triggerTime.getMonth() + 1, // Months are 1-based in expo-notifications
        day: triggerTime.getDate(),
        hour: triggerTime.getHours(),
        minute: triggerTime.getMinutes(),
        repeats: false,
        type: "calendar",
      },
    };

    const identifier = await Notifications.scheduleNotificationAsync(
      schedulingOptions
    );

    // Save the alarm details to AsyncStorage with status set to true (on)
    const newAlarm = {
      id: identifier,
      time: triggerTime.toISOString(),
      status: true, // Alarm is on by default
    };

    try {
      const storedAlarms = await AsyncStorage.getItem("alarms");
      const alarms = storedAlarms ? JSON.parse(storedAlarms) : [];
      alarms.push(newAlarm);
      await AsyncStorage.setItem("alarms", JSON.stringify(alarms));
    } catch (error) {
      console.error("Error saving alarm:", error);
    }

    alert(
      `Alarm set for ${triggerTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    );
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Alarm Time</Text>
      <Button title="Select Time" onPress={showTimePicker} />
      {showPicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={onChange}
          is24Hour={true}
        />
      )}
      <Text style={styles.timeText}>
        Selected Time: {time.toLocaleTimeString()}
      </Text>
      <Button title="Save Alarm" onPress={scheduleAlarm} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#16161d",
  },
  title: {
    fontSize: 24,
    marginVertical: 50,
    color: "white",
  },
  timeText: {
    fontSize: 18,
    marginVertical: 16,
    color: "white",
  },
});
