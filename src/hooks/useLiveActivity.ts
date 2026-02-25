import { useCallback, useRef } from "react";
import { Platform } from "react-native";
import {
  startActivity,
  updateActivity,
  endActivity,
  areActivitiesEnabled,
} from "../../modules/live-activity";

interface StartParams {
  exerciseName: string;
  exerciseId: number;
  ghostWeight?: number;
  ghostReps?: number;
}

interface UpdateParams {
  currentSetNumber: number;
  lastSetWeight?: number;
  lastSetReps?: number;
  ghostWeight?: number;
  ghostReps?: number;
}

export function useLiveActivity() {
  const activityIdRef = useRef<string | null>(null);
  const isSupported = Platform.OS === "ios" && areActivitiesEnabled();

  const start = useCallback(
    (params: StartParams) => {
      if (!isSupported) return;

      if (activityIdRef.current) {
        endActivity();
      }

      const encodedName = encodeURIComponent(params.exerciseName);
      const deepLinkUrl = `theflowjournal://focused-entry?exerciseId=${params.exerciseId}&exerciseName=${encodedName}`;

      const id = startActivity({
        ...params,
        deepLinkUrl,
      });
      activityIdRef.current = id;
    },
    [isSupported]
  );

  const update = useCallback(
    (params: UpdateParams) => {
      if (!isSupported || !activityIdRef.current) return;
      updateActivity(params);
    },
    [isSupported]
  );

  const end = useCallback(() => {
    if (!isSupported || !activityIdRef.current) return;
    endActivity();
    activityIdRef.current = null;
  }, [isSupported]);

  return { start, update, end, isSupported };
}
