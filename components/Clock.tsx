import React, { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";

export default function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    // Function to update the time
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setTime(`${hours}:${minutes}`);
    };

    // Update time immediately upon mount
    updateTime();

    // Update time every second
    const intervalId = setInterval(updateTime, 1000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return <Text style={styles.clockText}>{time}</Text>;
}

const styles = StyleSheet.create({
  clockText: {
    fontSize: 80,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
});
