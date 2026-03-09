import { useEffect, useState } from "react";
import { getLastSessionSets } from "@/src/db/queries";

interface GhostSet {
  weight: number;
  reps: number;
  value: number;
}

export function useExerciseHistory(exerciseName: string) {
  const [ghostSets, setGhostSets] = useState<GhostSet[]>([]);

  useEffect(() => {
    const sets = getLastSessionSets(exerciseName);
    setGhostSets(sets);
  }, [exerciseName]);

  function getGhostForSet(setIndex: number): GhostSet | null {
    return ghostSets[setIndex] ?? null;
  }

  return { ghostSets, getGhostForSet };
}
