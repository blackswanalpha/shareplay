"use client";

import { useEffect, useRef } from "react";
import { useSetAtom } from "jotai";
import { apiFetch, getAccessToken } from "@/lib/api";
import { serviceStatusAtom } from "@/store/roomAtoms";
import type { Broadcast } from "@/lib/types";

const POLL_INTERVAL_MS = 30_000; // 30 seconds

/**
 * Polls the REST API for active service status.
 * No socket connection — safe for the dashboard.
 */
export function useServiceStatus() {
  const setServiceStatus = useSetAtom(serviceStatusAtom);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    let cancelled = false;

    async function poll() {
      if (cancelled) return;
      try {
        const data = await apiFetch<{ service_status: Broadcast | null }>(
          "/admin/broadcast/service-status"
        );
        if (!cancelled) {
          setServiceStatus(data.service_status);
        }
      } catch {
        // Silently ignore — network errors, 401s handled by apiFetch
      }
    }

    // Fetch immediately, then poll
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [setServiceStatus]);
}
