import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";

type SosNotificationType = "SOS_ALERT" | "SOS_ESCALATED" | "SOS_RESOLVED";

type WebSocketNotification = {
  notificationId?: number;
  type?: string;
  title?: string;
  message?: string;
  payload?: string;
  priority?: string;
  sentAt?: string;
};

type SosNotification = {
  sosId: number;
  type: SosNotificationType;
  title: string;
  message: string;
  triggeredBy?: string;
  status?: string;
  receivedAt: string;
};

const SOS_TYPES: SosNotificationType[] = ["SOS_ALERT", "SOS_ESCALATED", "SOS_RESOLVED"];
const ALERT_TYPES: SosNotificationType[] = ["SOS_ALERT", "SOS_ESCALATED"];

const GlobalSosNotification: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const seenAlertsRef = useRef<Set<number>>(new Set());
  const [activeAlert, setActiveAlert] = useState<SosNotification | null>(null);
  const [queue, setQueue] = useState<SosNotification[]>([]);

  const isAdmin = useMemo(
    () => (user?.userType || "").toUpperCase() === "ADMIN",
    [user?.userType]
  );

  const wsBase = useMemo(() => {
    const base =
      process.env.REACT_APP_API_BASE_URL || "https://api.mssus.it.com/api/v1";
    try {
      const url = new URL(base);
      url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
      const path = url.pathname.replace(/\/api\/v1$/, "");
      return `${url.origin}${path || ""}/ws-native`;
    } catch {
      return null;
    }
  }, []);

  const clearReconnectTimer = () => {
    if (reconnectRef.current) {
      window.clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
  };

  const scheduleReconnect = useCallback(() => {
    if (reconnectRef.current) {
      return;
    }
    reconnectRef.current = window.setTimeout(() => {
      reconnectRef.current = null;
      connect();
    }, 5000);
  }, []);

  const parsePayload = (payload?: string) => {
    if (!payload) return null;
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  };

  const enqueueAlert = useCallback((alert: SosNotification) => {
    if (seenAlertsRef.current.has(alert.sosId)) {
      return;
    }
    seenAlertsRef.current.add(alert.sosId);
    setQueue((prev) => [...prev, alert]);
  }, []);

  const onNotification = useCallback(
    (data: WebSocketNotification) => {
      const type = data.type as SosNotificationType | undefined;
      if (!type || !SOS_TYPES.includes(type)) {
        return;
      }

      const payload = parsePayload(data.payload);
      const sosId =
        Number(payload?.sosId ?? payload?.alertId ?? payload?.id ?? 0) || 0;
      if (!sosId || !ALERT_TYPES.includes(type)) {
        return;
      }

      enqueueAlert({
        sosId,
        type,
        title: data.title || "SOS alert requires attention",
        message: data.message || "Có cảnh báo SOS mới cần xử lý.",
        triggeredBy: payload?.triggeredBy,
        status: payload?.status,
        receivedAt: data.sentAt || new Date().toISOString(),
      });
    },
    [enqueueAlert]
  );

  const connect = useCallback(() => {
    if (!wsBase || !token || !isAuthenticated || !isAdmin) {
      return;
    }
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const url = `${wsBase}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(url, ["v12.stomp"]);
      socketRef.current = ws;

      ws.onopen = () => {
        const connectFrame = `CONNECT\naccept-version:1.2\nhost:/\nAuthorization:Bearer ${token}\n\n\0`;
        ws.send(connectFrame);
      };

      ws.onmessage = (event) => {
        const frame = event.data as string;
        if (frame.startsWith("CONNECTED")) {
          const subFrame =
            "SUBSCRIBE\nid:sos-global\ndestination:/user/queue/notifications\n\n\0";
          ws.send(subFrame);
          return;
        }

        const bodyStart = frame.indexOf("\n\n");
        if (bodyStart === -1) {
          return;
        }

        const body = frame.substring(
          bodyStart + 2,
          frame.indexOf("\0", bodyStart)
        );
        if (!body) return;

        try {
          const parsed = JSON.parse(body) as WebSocketNotification;
          onNotification(parsed);
        } catch {
          return;
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onclose = () => {
        socketRef.current = null;
        scheduleReconnect();
      };
    } catch {
      scheduleReconnect();
    }
  }, [wsBase, token, isAuthenticated, isAdmin, onNotification, scheduleReconnect]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      clearReconnectTimer();
      return;
    }

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      clearReconnectTimer();
    };
  }, [connect, isAuthenticated, isAdmin]);

  useEffect(() => {
    if (!activeAlert && queue.length > 0) {
      setActiveAlert(queue[0]);
      setQueue((prev) => prev.slice(1));
    }
  }, [activeAlert, queue]);

  useEffect(() => {
    if (!activeAlert) return;
    const timer = window.setTimeout(() => setActiveAlert(null), 15000);
    return () => window.clearTimeout(timer);
  }, [activeAlert]);

  const handleOpen = () => {
    if (!activeAlert) return;
    navigate(`/safety?sosId=${activeAlert.sosId}`);
    setActiveAlert(null);
  };

  const handleDismiss = () => {
    setActiveAlert(null);
  };

  if (!activeAlert) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        key={activeAlert.sosId}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-6 right-6 z-[9999] max-w-md"
      >
        <motion.div
          animate={{
            boxShadow: [
              "0 0 0 rgba(239, 68, 68, 0.0)",
              "0 0 24px rgba(239, 68, 68, 0.55)",
              "0 0 0 rgba(239, 68, 68, 0.0)",
            ],
          }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="rounded-2xl border border-red-200/60 bg-gradient-to-br from-red-600 via-red-500 to-rose-600 text-white shadow-2xl"
        >
          <div className="flex items-start gap-4 p-5">
            <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <ExclamationTriangleIcon className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-white/80">
                Sos alert
              </p>
              <h3 className="text-lg font-semibold">
                #{activeAlert.sosId} cần xử lý ngay
              </h3>
              <p className="mt-1 text-sm text-white/90">
                {activeAlert.message}
              </p>
              {activeAlert.triggeredBy && (
                <p className="mt-2 text-xs text-white/70">
                  Kích hoạt bởi: {activeAlert.triggeredBy}
                </p>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleOpen}
                  className="rounded-lg bg-white/90 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-white"
                >
                  Mở trang an toàn
                </button>
                <button
                  onClick={handleDismiss}
                  className="rounded-lg border border-white/40 px-4 py-2 text-xs font-semibold text-white/90 transition hover:bg-white/10"
                >
                  Để sau
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalSosNotification;
