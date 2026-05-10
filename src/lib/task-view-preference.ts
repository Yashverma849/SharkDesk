"use client";

import { useCallback, useEffect, useState } from "react";

export type TaskViewMode = "table" | "list";

const KEYS = {
  project: "sharkdesk-task-view-project",
  mywork: "sharkdesk-task-view-mywork",
} as const;

export type TaskViewScope = keyof typeof KEYS;

export function useTaskViewPreference(scope: TaskViewScope) {
  const storageKey = KEYS[scope];
  const [mode, setModeState] = useState<TaskViewMode>("table");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === "table" || raw === "list") setModeState(raw);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const setMode = useCallback(
    (next: TaskViewMode) => {
      setModeState(next);
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        /* ignore */
      }
    },
    [storageKey],
  );

  return [mode, setMode] as const;
}
