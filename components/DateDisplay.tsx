import React, { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";

export default function DateDisplay() {
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    const updateDate = () => {
      const today = new Date();
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const newDateString = today.toLocaleDateString(undefined, options);
      setDateString(newDateString);
    };

    updateDate(); // Initial call

    // Update date every 1 minute
    const intervalId = setInterval(updateDate, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return <Text style={styles.dateText}>{dateString}</Text>;
}

const styles = StyleSheet.create({
  dateText: {
    fontSize: 24,
    textAlign: "center",
    color: "white",
  },
});
