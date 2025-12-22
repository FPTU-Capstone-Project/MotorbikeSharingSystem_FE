import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  FlagIcon,
  ExclamationTriangleIcon,
  MapIcon,
  GlobeAmericasIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import {
  getSOSAlertById,
  acknowledgeSOSAlert,
  resolveSOSAlert,
  formatSOSStatus,
  getStatusColorClass,
} from "../services/sosService";
import { SOSAlert } from "../types";
import SOSAlertTimeline from "./SOSAlertTimeline";
import { rideService } from "../services/apiService";
import { apiFetch } from "../utils/api";
import maplibregl, {
  Map as MapLibreMap,
  LngLatLike,
  LngLatBoundsLike,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface SOSAlertDetailsModalProps {
  alertId: number;
  isOpen: boolean;
  onClose: () => void;
  onAlertUpdated?: () => void;
  isAdmin?: boolean;
}

export default function SOSAlertDetailsModal({
  alertId,
  isOpen,
  onClose,
  onAlertUpdated,
  isAdmin = false,
}: SOSAlertDetailsModalProps) {
  const [alert, setAlert] = useState<SOSAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [acknowledgeNote, setAcknowledgeNote] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [showAcknowledgeForm, setShowAcknowledgeForm] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [rideDetail, setRideDetail] = useState<any | null>(null);
  const [trackingSnapshot, setTrackingSnapshot] = useState<any | null>(null);
  const [trackingPolyline, setTrackingPolyline] = useState<[number, number][]>(
    []
  );
  const [plannedPolyline, setPlannedPolyline] = useState<[number, number][]>(
    []
  );
  const [isSubscribing, setIsSubscribing] = useState(false);
  const mapRef = useRef<MapLibreMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const startMarkerRef = useRef<maplibregl.Marker | null>(null);
  const endMarkerRef = useRef<maplibregl.Marker | null>(null);
  const sosMarkerRef = useRef<maplibregl.Marker | null>(null);
  const driverMarkerRef = useRef<maplibregl.Marker | null>(null);
  const riderMarkerRef = useRef<maplibregl.Marker | null>(null);
  const trackingSocketRef = useRef<WebSocket | null>(null);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadAlert = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSOSAlertById(alertId);
      setAlert(data);
      const rideId =
        data?.sharedRideId ||
        data?.rideId ||
        (data?.rideSnapshot as any)?.sharedRideId ||
        (data?.rideSnapshot as any)?.rideId;
      if (rideId) {
        try {
          const rideData: any = await rideService.getRideById(String(rideId));
          setRideDetail(rideData);
          const encodedRoute =
            (rideData as any)?.route?.polyline ||
            (rideData as any)?.route_polyline ||
            (rideData as any)?.polyline ||
            ((rideData as any)?.route_summary &&
              (rideData as any).route_summary.polyline);
          console.log('🗺️ SOS Alert - Encoded route:', encodedRoute?.substring(0, 50));
          const decoded = decodePolyline(encodedRoute);
          console.log('🗺️ SOS Alert - Decoded planned polyline points:', decoded.length);
          setPlannedPolyline(decoded);
        } catch (err) {
          console.warn("Không tải được thông tin chuyến đi cho SOS:", err);
        }
        try {
          const snap = await apiFetch<any>(`/ride-tracking/${rideId}/snapshot`);
          setTrackingSnapshot(snap);
          if (snap?.polyline) {
            const trackingDecoded = decodePolyline(snap.polyline);
            console.log('🗺️ SOS Alert - Decoded tracking polyline points:', trackingDecoded.length);
            setTrackingPolyline(trackingDecoded);
          }
        } catch (err) {
          console.warn("Không tải được tracking snapshot cho SOS:", err);
        }
      }
    } catch (error: any) {
      console.error("Failed to load alert:", error);
      toast.error(error?.message || "Không thể tải thông tin cảnh báo");
    } finally {
      setLoading(false);
    }
  }, [alertId]);

  useEffect(() => {
    if (isOpen) {
      loadAlert();
    } else {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
      setRideDetail(null);
      setTrackingSnapshot(null);
      setIsSubscribing(false);
      if (trackingSocketRef.current) {
        trackingSocketRef.current.close();
        trackingSocketRef.current = null;
      }
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
    }
  }, [isOpen, loadAlert]);

  const handleAcknowledge = async () => {
    if (!alert) return;

    setIsAcknowledging(true);
    try {
      await acknowledgeSOSAlert(Number(alert.id), {
        note: acknowledgeNote.trim() || undefined,
      });
      toast.success("Đã xác nhận cảnh báo SOS");
      setAcknowledgeNote("");
      setShowAcknowledgeForm(false);
      await loadAlert();
      if (onAlertUpdated) onAlertUpdated();
    } catch (error: any) {
      console.error("Failed to acknowledge alert:", error);
      toast.error(error?.message || "Không thể xác nhận cảnh báo");
    } finally {
      setIsAcknowledging(false);
    }
  };

  const applyTrackingSnapshot = (snapshot: any) => {
    if (!snapshot) return;
    setTrackingSnapshot((prev: any) => ({
      ...prev,
      ...snapshot,
      driverLat: snapshot.driverLat ?? snapshot.currentLat ?? prev?.driverLat,
      driverLng: snapshot.driverLng ?? snapshot.currentLng ?? prev?.driverLng,
      riderLat: snapshot.riderLat ?? prev?.riderLat,
      riderLng: snapshot.riderLng ?? prev?.riderLng,
      polyline: snapshot.polyline ?? prev?.polyline,
      estimatedArrival: snapshot.estimatedArrival ?? prev?.estimatedArrival,
      timestamp: snapshot.timestamp ?? prev?.timestamp,
    }));
    if (snapshot.polyline) {
      setTrackingPolyline(decodePolyline(snapshot.polyline));
    }
  };

  const fetchTrackingSnapshot = useCallback(async (rideId: string | number) => {
    try {
      const data = await apiFetch<any>(`/ride-tracking/${rideId}/snapshot`);
      applyTrackingSnapshot(data);
    } catch (error: any) {
      console.warn(
        "⚠️ Không thể tải tracking snapshot:",
        error?.message || error
      );
    }
  }, []);

  const subscribeTracking = useCallback((rideId: string | number) => {
    const wsBase = getWsBaseUrl();
    if (!wsBase) {
      console.warn("Không xác định được WebSocket endpoint");
      return;
    }
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("authToken");
    const url = `${wsBase}?token=${encodeURIComponent(token || "")}`;

    try {
      setIsSubscribing(true);
      const ws = new WebSocket(url, ["v12.stomp"]);
      trackingSocketRef.current = ws;

      ws.onopen = () => {
        const connectFrame = `CONNECT\naccept-version:1.2\nhost:/\n${
          token ? `Authorization:Bearer ${token}\n` : ""
        }\n\0`;
        ws.send(connectFrame);
      };

      ws.onmessage = (event) => {
        const data: string = event.data;
        if (data.startsWith("CONNECTED")) {
          const subFrame = `SUBSCRIBE\nid:ride-${rideId}\ndestination:/topic/ride.tracking.${rideId}\n\n\0`;
          ws.send(subFrame);
          return;
        }

        const splitIndex = data.indexOf("\n\n");
        if (splitIndex !== -1) {
          const body = data.substring(
            splitIndex + 2,
            data.indexOf("\0", splitIndex)
          );
          try {
            const parsed = JSON.parse(body);
            applyTrackingSnapshot({
              driverLat: parsed.currentLat ?? parsed.driverLat,
              driverLng: parsed.currentLng ?? parsed.driverLng,
              riderLat: parsed.riderLat,
              riderLng: parsed.riderLng,
              polyline: parsed.polyline,
              estimatedArrival: parsed.estimatedArrival,
              timestamp: parsed.timestamp,
            });
          } catch (err) {
            console.warn("⚠️ Không phân tích được dữ liệu tracking:", err);
          }
        }
      };

      ws.onerror = (err) => {
        console.error("❌ Lỗi WebSocket tracking:", err);
      };

      ws.onclose = () => {
        setIsSubscribing(false);
        trackingSocketRef.current = null;
      };
    } catch (error: any) {
      console.error("❌ Không thể kết nối tracking:", error?.message || error);
      setIsSubscribing(false);
    }
  }, []);

  const cleanupTracking = useCallback((rideId?: string | number | null) => {
    if (
      trackingSocketRef.current &&
      trackingSocketRef.current.readyState === WebSocket.OPEN
    ) {
      try {
        trackingSocketRef.current.send(`UNSUBSCRIBE\nid:ride-${rideId}\n\n\0`);
        trackingSocketRef.current.send("DISCONNECT\n\n\0");
      } catch (_) {}
      trackingSocketRef.current.close();
    }
    trackingSocketRef.current = null;
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    setIsSubscribing(false);
  }, []);

  const handleResolve = async (falseAlarm: boolean) => {
    if (!alert) return;

    setIsResolving(true);
    try {
      await resolveSOSAlert(Number(alert.id), {
        resolutionNotes: resolutionNotes.trim() || undefined,
        falseAlarm,
      });
      toast.success(
        falseAlarm
          ? "Đã đánh dấu là báo động giả"
          : "Đã giải quyết cảnh báo SOS"
      );
      setResolutionNotes("");
      setShowResolveForm(false);
      await loadAlert();
      if (onAlertUpdated) onAlertUpdated();
    } catch (error: any) {
      console.error("Failed to resolve alert:", error);
      toast.error(error?.message || "Không thể giải quyết cảnh báo");
    } finally {
      setIsResolving(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;
    const dayPart = new Intl.DateTimeFormat("vi-VN", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
    const timePart = new Intl.DateTimeFormat("vi-VN", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(d);
    return `${dayPart}, ${timePart}`;
  };

  const decodePolyline = (encoded?: string | null): [number, number][] => {
    if (!encoded) return [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;
    const coordinates: [number, number][] = [];

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      coordinates.push([lng / 1e5, lat / 1e5]);
    }
    return coordinates;
  };

  const startLocation =
    rideDetail?.start_location ||
    rideDetail?.startLocation ||
    rideDetail?.pickup_location ||
    null;
  const endLocation =
    rideDetail?.end_location ||
    rideDetail?.endLocation ||
    rideDetail?.dropoff_location ||
    null;
  const routePolyline =
    rideDetail?.route?.polyline ||
    rideDetail?.polyline ||
    (rideDetail?.route_summary && rideDetail.route_summary.polyline);
  const decodedRoute = decodePolyline(routePolyline);
  const decodedTracking = trackingPolyline.length
    ? trackingPolyline
    : decodePolyline(trackingSnapshot?.polyline);
  const activeLine =
    decodedTracking.length > 0 ? decodedTracking : decodedRoute;
  const formatCoord = (val?: number) =>
    typeof val === "number" && !Number.isNaN(val) ? val.toFixed(5) : undefined;
  const rideIdForTracking =
    rideDetail?.shared_ride_id ||
    rideDetail?.sharedRideId ||
    rideDetail?.id ||
    rideDetail?.rideId ||
    alert?.sharedRideId;

  // Setup realtime tracking similar to ride details
  useEffect(() => {
    if (!rideIdForTracking || !isOpen) {
      cleanupTracking();
      return;
    }

    fetchTrackingSnapshot(rideIdForTracking);
    subscribeTracking(rideIdForTracking);
    if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    trackingIntervalRef.current = setInterval(
      () => fetchTrackingSnapshot(rideIdForTracking),
      15000
    );

    return () => {
      cleanupTracking(rideIdForTracking);
    };
  }, [
    rideIdForTracking,
    isOpen,
    fetchTrackingSnapshot,
    subscribeTracking,
    cleanupTracking,
  ]);

  const getWsBaseUrl = (): string | null => {
    const base =
      process.env.REACT_APP_API_BASE_URL || "http://localhost:8081/api/v1";
    try {
      const url = new URL(base);
      url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
      const path = url.pathname.replace(/\/api\/v1$/, "");
      return `${url.origin}${path || ""}/ws-native`;
    } catch {
      return null;
    }
  };

  const updateMarker = (
    markerRef: React.MutableRefObject<maplibregl.Marker | null>,
    coord: { lat: number; lng: number } | null,
    color: string
  ) => {
    const map = mapRef.current;
    if (!map) return;
    if (!coord || Number.isNaN(coord.lat) || Number.isNaN(coord.lng)) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }
    const pos: LngLatLike = [coord.lng, coord.lat];
    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({ color })
        .setLngLat(pos)
        .addTo(map);
    } else {
      markerRef.current.setLngLat(pos);
    }
  };

  const renderLineLayer = (
    id: string,
    coords: [number, number][],
    color: string,
    width = 4,
    opacity = 0.9,
    dasharray?: number[]
  ) => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      console.log(`🗺️ renderLineLayer(${id}) - Map not ready`);
      return;
    }

    if (map.getLayer(id)) map.removeLayer(id);
    if (map.getSource(id)) map.removeSource(id);
    if (!coords || coords.length === 0) {
      console.log(`🗺️ renderLineLayer(${id}) - No coords`);
      return;
    }

    console.log(`🗺️ renderLineLayer(${id}) - Adding ${coords.length} points, color: ${color}`);
    console.log(`🗺️ First 2 coords for ${id}:`, JSON.stringify(coords.slice(0, 2)));

    try {
      map.addSource(id, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: coords },
        },
      });

      map.addLayer({
        id,
        type: "line",
        source: id,
        paint: {
          "line-color": color,
          "line-width": width,
          "line-opacity": opacity,
          ...(dasharray ? { "line-dasharray": dasharray } : {}),
        },
      });
      console.log(`🗺️ renderLineLayer(${id}) - SUCCESS`);
    } catch (error) {
      console.error(`🗺️ renderLineLayer(${id}) - ERROR:`, error);
    }
  };

  const fitMapToMarkers = (
    line: [number, number][],
    points: Array<{ lng: number; lat: number } | null>
  ) => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      console.log('🗺️ fitMapToMarkers skipped - map not ready');
      return;
    }
    const coords: [number, number][] = [];

    // Add polyline coords
    line.forEach((c) => {
      if (Array.isArray(c) && c.length === 2 &&
          typeof c[0] === 'number' && typeof c[1] === 'number' &&
          !Number.isNaN(c[0]) && !Number.isNaN(c[1]) &&
          Math.abs(c[0]) <= 180 && Math.abs(c[1]) <= 90) {
        coords.push(c);
      }
    });

    // Add marker points (with strict validation)
    points.forEach((p, idx) => {
      if (p && typeof p.lat === 'number' && typeof p.lng === 'number' &&
          !Number.isNaN(p.lat) && !Number.isNaN(p.lng) &&
          Math.abs(p.lng) <= 180 && Math.abs(p.lat) <= 90) {
        console.log(`🗺️ Adding marker point ${idx}:`, [p.lng, p.lat]);
        coords.push([p.lng, p.lat]);
      } else {
        console.log(`🗺️ SKIPPED invalid marker point ${idx}:`, p);
      }
    });

    console.log('🗺️ fitMapToMarkers - total valid coords:', coords.length);
    if (coords.length === 0) {
      console.log('🗺️ No coords to fit');
      return;
    }
    console.log('🗺️ Sample coords (first 3):', JSON.stringify(coords.slice(0, 3)));
    const bounds = coords.reduce(
      (b, c) => b.extend(c),
      new maplibregl.LngLatBounds(
        coords[0],
        coords[0]
      ) as maplibregl.LngLatBounds
    );
    const boundsArray = bounds.toArray();
    console.log('🗺️ Fitting bounds [[sw], [ne]]:', JSON.stringify(boundsArray));
    console.log('🗺️ SW (bottom-left):', boundsArray[0], 'NE (top-right):', boundsArray[1]);
    map.fitBounds(bounds as LngLatBoundsLike, { padding: 50, duration: 500, maxZoom: 15 });
  };

  useEffect(() => {
    if (!isOpen || loading || !rideDetail || !mapContainerRef.current) return;
    if (!mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainerRef.current,
        style: 'https://tiles.goong.io/assets/goong_map_web.json?api_key=HSFVF5OYPQRcB5mKoJvyYJuknI16LAzvrgtDARwO',
        center: [
          alert?.currentLng || 106.809844,
          alert?.currentLat || 10.84148,
        ],
        zoom: 14,
        transformRequest: (url) => {
          if (url.includes('tiles.goong.io') && !url.includes('api_key=')) {
            const separator = url.includes('?') ? '&' : '?';
            return { url: `${url}${separator}api_key=HSFVF5OYPQRcB5mKoJvyYJuknI16LAzvrgtDARwO` };
          }
          return { url };
        },
      });
      mapRef.current.addControl(
        new maplibregl.NavigationControl(),
        "top-right"
      );
      mapRef.current.on("load", () => {
        setMapReady(true);
        mapRef.current?.resize();
      });
    } else {
      mapRef.current.resize();
      if (mapRef.current.isStyleLoaded()) {
        setMapReady(true);
      } else {
        mapRef.current.once("load", () => setMapReady(true));
      }
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
    };
  }, [isOpen, loading, rideDetail, alert?.currentLat, alert?.currentLng]);

  // Render map content after data or map ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    updateMarker(
      startMarkerRef,
      startLocation
        ? {
            lat: startLocation.lat ?? startLocation.latitude,
            lng: startLocation.lng ?? startLocation.longitude,
          }
        : null,
      "#22c55e"
    );
    updateMarker(
      endMarkerRef,
      endLocation
        ? {
            lat: endLocation.lat ?? endLocation.latitude,
            lng: endLocation.lng ?? endLocation.longitude,
          }
        : null,
      "#ef4444"
    );
    updateMarker(
      sosMarkerRef,
      alert ? { lat: alert.currentLat, lng: alert.currentLng } : null,
      "#f97316"
    );
    updateMarker(
      driverMarkerRef,
      trackingSnapshot &&
        trackingSnapshot.driverLat != null &&
        trackingSnapshot.driverLng != null
        ? {
            lat: Number(trackingSnapshot.driverLat),
            lng: Number(trackingSnapshot.driverLng),
          }
        : null,
      "#2563eb"
    );
    updateMarker(
      riderMarkerRef,
      trackingSnapshot &&
        trackingSnapshot.riderLat != null &&
        trackingSnapshot.riderLng != null
        ? {
            lat: Number(trackingSnapshot.riderLat),
            lng: Number(trackingSnapshot.riderLng),
          }
        : null,
      "#f59e0b"
    );

    // Render planned route (dotted line)
    const plannedCoords = plannedPolyline.length > 0 ? plannedPolyline : decodedRoute;
    console.log('🗺️ Rendering planned route, points:', plannedCoords.length);
    if (plannedCoords.length > 0) {
      renderLineLayer(
        "sos-planned-route",
        plannedCoords,
        "#94A3B8",
        3,
        0.7,
        [1.5, 1.5]
      );
    }

    // Render tracking route (solid line) on top
    console.log('🗺️ Rendering tracking route, points:', decodedTracking.length);
    if (decodedTracking.length > 0) {
      renderLineLayer("sos-tracking-route", decodedTracking, "#2563EB", 4, 0.95);
    }

    // Only fit to polyline coordinates to avoid invalid marker positions
    if (activeLine.length > 0) {
      fitMapToMarkers(activeLine, []);
    }
    map.resize();
  }, [
    alert,
    startLocation,
    endLocation,
    trackingSnapshot,
    plannedPolyline,
    decodedRoute,
    decodedTracking,
    activeLine,
    mapReady,
  ]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl max-w-4xl w-full my-8"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : alert ? (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-700 p-6 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <ExclamationTriangleIcon className="h-8 w-8 text-white" />
                      <h2 className="text-2xl font-bold text-white">
                        Cảnh báo SOS #{alert.id}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColorClass(
                          alert.status
                        )}`}
                      >
                        {formatSOSStatus(alert.status)}
                      </span>
                      {alert.escalationCount > 0 && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-300">
                          Đã báo cáo: {alert.escalationCount} lần
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* User Info */}
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <UserIcon className="h-5 w-5" />
                      Thông tin người dùng
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">Người kích hoạt</p>
                        <p className="font-semibold text-gray-900">
                          {alert.userName || `User ${alert.userId}`}
                        </p>
                        <p className="text-gray-600 dark:text-slate-300">
                          ID: {alert.userId}
                        </p>
                        {(alert.userPhone || alert.riderPhone) && (
                          <div className="flex items-center gap-2">
                            <PhoneIcon className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-gray-900">
                              {alert.userPhone || alert.riderPhone}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">Tài xế</p>
                        <p className="font-semibold text-gray-900">
                          {rideDetail?.driver_name ||
                            rideDetail?.driverName ||
                            "—"}
                        </p>
                        <p className="text-gray-600 dark:text-slate-300">
                          Xe:{" "}
                          {rideDetail?.vehicle_plate ||
                            rideDetail?.vehiclePlate ||
                            "—"}
                        </p>
                        {(alert.driverPhone ||
                          rideDetail?.driver_phone ||
                          rideDetail?.driverPhone) && (
                          <div className="flex items-center gap-2">
                            <PhoneIcon className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-gray-900">
                              {alert.driverPhone ||
                                rideDetail?.driver_phone ||
                                rideDetail?.driverPhone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5" />
                      Vị trí
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-slate-300">
                          Kinh độ:
                        </span>
                        <span className="ml-2 font-medium text-gray-900">
                          {alert.currentLat.toFixed(6)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-slate-300">
                          Vĩ độ:
                        </span>
                        <span className="ml-2 font-medium text-gray-900">
                          {alert.currentLng.toFixed(6)}
                        </span>
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${alert.currentLat},${alert.currentLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Xem trên Google Maps →
                      </a>
                    </div>
                  </div>

                  {/* Time Info */}
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <ClockIcon className="h-5 w-5" />
                      Thời gian
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-slate-300">
                          Tạo:
                        </span>
                        <span className="ml-2 font-medium text-gray-900">
                          {formatDate(alert.createdAt)}
                        </span>
                      </div>
                      {alert.acknowledgedAt && (
                        <div>
                          <span className="text-gray-600 dark:text-slate-300">
                            Xác nhận:
                          </span>
                          <span className="ml-2 font-medium text-gray-900">
                            {formatDate(alert.acknowledgedAt)}
                          </span>
                        </div>
                      )}
                      {alert.resolvedAt && (
                        <div>
                          <span className="text-gray-600 dark:text-slate-300">
                            Giải quyết:
                          </span>
                          <span className="ml-2 font-medium text-gray-900">
                            {formatDate(alert.resolvedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Emergency Contacts */}
                  {alert.contactInfo && alert.contactInfo.length > 0 && (
                    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <PhoneIcon className="h-5 w-5" />
                        Liên hệ khẩn cấp
                      </h3>
                      <div className="space-y-2">
                        {alert.contactInfo.map((contact, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium text-gray-900">
                              {contact.name}
                              {contact.isPrimary && (
                                <span className="ml-2 text-xs text-yellow-600">
                                  (Chính)
                                </span>
                              )}
                            </div>
                            <div className="text-gray-600 dark:text-slate-300">
                              {contact.phone}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {alert.description && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Mô tả:</h3>
                    <p className="text-gray-700">{alert.description}</p>
                  </div>
                )}

                {/* Ride + Tracking details */}
                {rideDetail ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapIcon className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">
                          Chi tiết chuyến đi
                        </h3>
                      </div>
                      <span className="text-xs text-gray-500">
                        Ride #
                        {rideDetail.shared_ride_id ||
                          rideDetail.sharedRideId ||
                          rideDetail.id ||
                          "N/A"}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-gray-900">Điểm đón</p>
                        <p className="text-gray-700">{startLocation.name}</p>
                        {formatCoord(
                          startLocation?.lat ?? startLocation?.latitude
                        ) &&
                          formatCoord(
                            startLocation?.lng ?? startLocation?.longitude
                          ) && (
                            <p className="text-xs text-gray-500">
                              (
                              {formatCoord(
                                startLocation?.lat ?? startLocation?.latitude
                              )}
                              ,{" "}
                              {formatCoord(
                                startLocation?.lng ?? startLocation?.longitude
                              )}
                              )
                            </p>
                          )}
                        <p className="font-medium text-gray-900 mt-3">
                          Điểm đến
                        </p>
                        <p className="text-gray-700">{endLocation.name}</p>
                        {formatCoord(
                          endLocation?.lat ?? endLocation?.latitude
                        ) &&
                          formatCoord(
                            endLocation?.lng ?? endLocation?.longitude
                          ) && (
                            <p className="text-xs text-gray-500">
                              (
                              {formatCoord(
                                endLocation?.lat ?? endLocation?.latitude
                              )}
                              ,{" "}
                              {formatCoord(
                                endLocation?.lng ?? endLocation?.longitude
                              )}
                              )
                            </p>
                          )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-600">Trạng thái:</span>
                          <span className="ml-2 font-semibold text-gray-900">
                            {(rideDetail.status || "").toString()}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-600">Tài xế:</span>
                          <span className="ml-2 font-semibold text-gray-900">
                            {rideDetail.driver_name ||
                              rideDetail.driverName ||
                              "N/A"}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-600">Phương tiện:</span>
                          <span className="ml-2 text-gray-900">
                            {rideDetail.vehicle_model ||
                              rideDetail.vehicleModel ||
                              "—"}{" "}
                            {rideDetail.vehicle_plate || rideDetail.vehiclePlate
                              ? `(${
                                  rideDetail.vehicle_plate ||
                                  rideDetail.vehiclePlate
                                })`
                              : ""}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-600">Thời gian:</span>
                          <span className="ml-2 text-gray-900">
                            {formatDate(
                              rideDetail.started_at ||
                                rideDetail.startedAt ||
                                rideDetail.scheduled_time ||
                                rideDetail.scheduledTime
                            )}
                          </span>
                        </p>
                        {trackingSnapshot && (
                          <p className="text-xs text-gray-500">
                            Cập nhật mới nhất:{" "}
                            {formatDate(
                              trackingSnapshot.timestamp ||
                                trackingSnapshot.updatedAt ||
                                new Date().toISOString()
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 h-64 rounded-lg overflow-hidden border border-gray-200">
                      <div
                        ref={mapContainerRef}
                        className="w-full h-full min-h-[16rem] bg-gray-100"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-green-500" />{" "}
                        Điểm đón
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-red-500" />{" "}
                        Điểm đến
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-orange-500" />{" "}
                        Vị trí SOS
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-4 h-[3px] rounded-full bg-blue-600" />{" "}
                        Lộ trình
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 flex items-center gap-3 text-sm text-slate-700">
                    <GlobeAmericasIcon className="h-5 w-5 text-slate-500" />
                    Không tìm thấy thông tin chuyến đi liên quan để hiển thị lộ
                    trình/tracking.
                  </div>
                )}

                {/* Admin Actions */}
                {isAdmin &&
                  alert.status !== "RESOLVED" &&
                  alert.status !== "FALSE_ALARM" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Hành động
                      </h3>

                      {/* Acknowledge Section */}
                      {alert.status !== "ACKNOWLEDGED" &&
                        !showAcknowledgeForm && (
                          <button
                            onClick={() => setShowAcknowledgeForm(true)}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mb-2"
                          >
                            <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                            Xác nhận cảnh báo
                          </button>
                        )}

                      {showAcknowledgeForm &&
                        alert.status !== "ACKNOWLEDGED" && (
                          <div className="space-y-3 mb-4">
                            <textarea
                              value={acknowledgeNote}
                              onChange={(e) =>
                                setAcknowledgeNote(e.target.value)
                              }
                              placeholder="Ghi chú xác nhận (tùy chọn)..."
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              rows={3}
                              disabled={isAcknowledging}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowAcknowledgeForm(false)}
                                disabled={isAcknowledging}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={handleAcknowledge}
                                disabled={isAcknowledging}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                              >
                                {isAcknowledging
                                  ? "Đang xác nhận..."
                                  : "Xác nhận"}
                              </button>
                            </div>
                          </div>
                        )}

                      {/* Resolve Section */}
                      {alert.status === "ACKNOWLEDGED" && !showResolveForm && (
                        <button
                          onClick={() => setShowResolveForm(true)}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          <FlagIcon className="h-5 w-5 inline mr-2" />
                          Giải quyết cảnh báo
                        </button>
                      )}

                      {showResolveForm && (
                        <div className="space-y-3">
                          <textarea
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            placeholder="Ghi chú giải quyết..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            rows={3}
                            disabled={isResolving}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowResolveForm(false)}
                              disabled={isResolving}
                              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => handleResolve(true)}
                              disabled={isResolving}
                              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                              Báo giả
                            </button>
                            <button
                              onClick={() => handleResolve(false)}
                              disabled={isResolving}
                              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              Đã giải quyết
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {/* Timeline */}
                <div className="border-t border-gray-200 pt-6">
                  <SOSAlertTimeline
                    alertId={Number(alert.id)}
                    autoRefresh={
                      alert.status === "ACTIVE" || alert.status === "ESCALATED"
                    }
                    refreshInterval={15000}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Không tìm thấy cảnh báo
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
