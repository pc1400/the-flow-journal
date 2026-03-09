import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { Timer } from "lucide-react-native";

interface RestTimerProps {
  durationSeconds: number;
  onDismiss: () => void;
  onComplete: () => void;
  startedAt?: number;
}

export function RestTimer({
  durationSeconds,
  onDismiss,
  onComplete,
  startedAt,
}: RestTimerProps) {
  const initialRemaining = startedAt
    ? Math.max(0, durationSeconds - Math.floor((Date.now() - startedAt) / 1000))
    : durationSeconds;
  const [remaining, setRemaining] = useState(initialRemaining);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return (
    <TouchableOpacity
      className="flex-row items-center bg-gray-800 rounded-full px-3 py-1.5"
      onPress={onDismiss}
      activeOpacity={0.7}
    >
      <Timer size={14} color="#fff" />
      <Text className="text-white text-sm font-bold ml-1.5">{display}</Text>
    </TouchableOpacity>
  );
}
