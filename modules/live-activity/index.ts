import { requireNativeModule, Platform } from "expo-modules-core";

interface StartActivityParams {
  exerciseName: string;
  exerciseId: number;
  deepLinkUrl: string;
  ghostWeight?: number;
  ghostReps?: number;
}

interface UpdateActivityParams {
  currentSetNumber: number;
  lastSetWeight?: number;
  lastSetReps?: number;
  ghostWeight?: number;
  ghostReps?: number;
}

let LiveActivityModule: any = null;
if (Platform.OS === "ios") {
  try {
    LiveActivityModule = requireNativeModule("LiveActivity");
  } catch {
    // Native module not available (e.g., running in Expo Go instead of dev client)
  }
}

export function startActivity(params: StartActivityParams): string | null {
  return LiveActivityModule?.startActivity(params) ?? null;
}

export function updateActivity(params: UpdateActivityParams): boolean {
  return LiveActivityModule?.updateActivity(params) ?? false;
}

export function endActivity(): boolean {
  return LiveActivityModule?.endActivity() ?? false;
}

export function areActivitiesEnabled(): boolean {
  return LiveActivityModule?.areActivitiesEnabled() ?? false;
}
