import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Card } from "@/src/components/Card";
import { getDatabase } from "@/src/db/db";

interface ProfileStats {
  totalWorkouts: number;
  totalVolume: number;
  totalDuration: number;
}

function getProfileStats(): ProfileStats {
  const db = getDatabase();
  const result = db.getFirstSync<{
    count: number;
    volume: number;
    duration: number;
  }>(
    `SELECT
      COUNT(*) as count,
      COALESCE(SUM(total_volume), 0) as volume,
      COALESCE(SUM(duration), 0) as duration
    FROM workouts
    WHERE duration > 0`
  );
  return {
    totalWorkouts: result?.count ?? 0,
    totalVolume: result?.volume ?? 0,
    totalDuration: result?.duration ?? 0,
  };
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function ProfileScreen() {
  const [stats, setStats] = useState<ProfileStats>({
    totalWorkouts: 0,
    totalVolume: 0,
    totalDuration: 0,
  });

  useFocusEffect(
    useCallback(() => {
      setStats(getProfileStats());
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 pt-4">
        <Text className="text-3xl font-sans-bold text-gray-900 mb-6">
          Profile
        </Text>

        <Text className="text-xs font-sans-bold uppercase text-gray-400 tracking-widest mb-3">
          All Time Stats
        </Text>

        <View className="gap-3">
          <Card>
            <Text className="text-sm font-sans text-gray-500">Total Workouts</Text>
            <Text className="text-2xl font-sans-bold text-gray-900 mt-1">
              {stats.totalWorkouts}
            </Text>
          </Card>

          <Card>
            <Text className="text-sm font-sans text-gray-500">Total Volume</Text>
            <Text className="text-2xl font-sans-bold text-gray-900 mt-1">
              {Math.round(stats.totalVolume).toLocaleString()} lbs
            </Text>
          </Card>

          <Card>
            <Text className="text-sm font-sans text-gray-500">Total Time</Text>
            <Text className="text-2xl font-sans-bold text-gray-900 mt-1">
              {formatDuration(stats.totalDuration)}
            </Text>
          </Card>
        </View>
      </View>
    </SafeAreaView>
  );
}
