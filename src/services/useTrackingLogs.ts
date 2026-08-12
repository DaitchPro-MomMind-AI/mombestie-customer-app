import { useCallback, useEffect, useState } from "react";
import { addLog, deleteLog, listLogs, seedDemoHistoryOnce, todaySummary } from "./trackingService";
import type { DailySummary, NewTrackingLog, TrackingLog } from "./types";

/**
 * React binding over the mock Tracking Service. Re-reads from storage on
 * mount so any screen showing tracking data reflects the latest saved
 * state, even though the underlying store isn't a live subscription.
 */
export function useTrackingLogs(childId: string) {
  const [logs, setLogs] = useState<TrackingLog[]>([]);
  const [summary, setSummary] = useState<DailySummary>(() => todaySummary(childId));

  const refresh = useCallback(() => {
    setLogs(listLogs(childId));
    setSummary(todaySummary(childId));
  }, [childId]);

  useEffect(() => {
    seedDemoHistoryOnce(childId);
    refresh();
  }, [childId, refresh]);

  const save = useCallback(
    (input: Omit<NewTrackingLog, "childId">) => {
      addLog({ ...input, childId });
      refresh();
    },
    [childId, refresh],
  );

  const remove = useCallback(
    (logId: string) => {
      deleteLog(childId, logId);
      refresh();
    },
    [childId, refresh],
  );

  return { logs, summary, save, remove, refresh };
}
