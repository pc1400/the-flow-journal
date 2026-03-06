import { TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Activity } from "lucide-react-native";
import { useWorkout } from "@/src/context/WorkoutContext";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";

export function ActiveWorkoutFAB() {
  const router = useRouter();
  const { isActive } = useWorkout();
  const glowScale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      glowScale.value = withRepeat(
        withTiming(1.5, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      glowScale.value = 1;
    }
  }, [isActive]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: 2 - glowScale.value, // fades from 1 → 0.5 as it scales
  }));

  if (!isActive) return null;

  return (
    <View className="absolute bottom-24 right-5" style={{ zIndex: 100 }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push("/active-workout")}
      >
        {/* Glow circle behind */}
        <Animated.View
          className="absolute bg-primary rounded-full"
          style={[
            {
              width: 56,
              height: 56,
              opacity: 0.3,
            },
            glowStyle,
          ]}
        />
        {/* Main FAB */}
        <View
          className="bg-primary rounded-full items-center justify-center"
          style={{ width: 56, height: 56 }}
        >
          <Activity size={24} color="#fff" />
        </View>
      </TouchableOpacity>
    </View>
  );
}
