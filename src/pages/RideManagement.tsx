import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPinIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon,
  EyeIcon,
  XMarkIcon,
  CalendarDaysIcon,
  FlagIcon,
  MapIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import maplibregl, {
  Map as MapLibreMap,
  LngLatLike,
  LngLatBoundsLike,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Ride } from "../types";
import toast from "react-hot-toast";
import { goongService } from "../services/goongService";
import { apiFetch } from "../utils/api";
import { rideService } from "../services/apiService";
import Pagination from "../components/Pagination";

type RideStatusDisplay = Ride["status"] | "scheduled";

const pickValue = (source: any, keys: string[]) => {
  for (const key of keys) {
    if (source && source[key] !== undefined && source[key] !== null) {
      return source[key];
    }
  }
  return undefined;
};

const normalizeLocation = (loc: any) => {
  if (!loc) return null;
  const lat = pickValue(loc, ["lat", "latitude", "pickupLat", "startLat"]);
  const lng = pickValue(loc, [
    "lng",
    "longitude",
    "pickupLng",
    "startLng",
    "lon",
  ]);

  if (lat === undefined || lng === undefined || lat === null || lng === null)
    return null;

  return {
    lat: Number(lat),
    lng: Number(lng),
    name: pickValue(loc, ["name"]),
    address:
      pickValue(loc, ["address"]) || pickValue(loc, ["formatted_address"]),
  };
};

const formatCurrency = (value?: number | string | null) => {
  if (value === null || value === undefined) return "—";
  const numeric = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numeric)) return String(value);
  return `${numeric.toLocaleString("vi-VN")}đ`;
};

const formatDistance = (km?: number | string | null) => {
  if (km === null || km === undefined) return "—";
  const numeric = typeof km === "string" ? Number(km) : km;
  if (Number.isNaN(numeric)) return String(km);
  if (numeric < 1) return `${(numeric * 1000).toFixed(0)} m`;
  return `${numeric.toFixed(1)} km`;
};

const formatDurationMinutes = (minutes?: number | string | null) => {
  if (minutes === null || minutes === undefined) return "—";
  const numeric = typeof minutes === "string" ? Number(minutes) : minutes;
  if (Number.isNaN(numeric)) return String(minutes);
  if (numeric < 60) return `${numeric.toFixed(0)} phút`;
  const hrs = Math.floor(numeric / 60);
  const mins = Math.round(numeric % 60);
  return `${hrs}h ${mins}m`;
};

const formatDateTime = (raw?: string | null) => {
  if (!raw) return "—";
  const trimmed = raw
    .replace(/([+-]\d{2}:?\d{2}|Z)$/i, "")
    .replace(/\.\d+$/, "");
  const match =
    trimmed.match(/(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/) ||
    [];
  const [, year, month, day, hour, minute] = match;
  if (!year || !month || !day || !hour || !minute) return raw;
  return `${day}/${month}/${year} ${hour}:${minute}`;
};

const normalizeRideStatus = (status?: string | null): RideStatusDisplay => {
  const value = (status || "").toString().toLowerCase();
  if (
    ["pending", "accepted", "ongoing", "completed", "cancelled"].includes(value)
  ) {
    return value as Ride["status"];
  }
  if (value === "scheduled") return "scheduled";
  return "pending";
};

type TrackingSnapshot = {
  driverLat?: number | null;
  driverLng?: number | null;
  riderLat?: number | null;
  riderLng?: number | null;
  polyline?: string | null;
};

export default function RideManagement() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | Ride["status"]>(
    "all"
  );
  const [filterType, setFilterType] = useState<"all" | Ride["type"]>("all");
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [selectedRideDetail, setSelectedRideDetail] = useState<any | null>(
    null
  );
  const [trackingPolyline, setTrackingPolyline] = useState<[number, number][]>(
    []
  );
  const [plannedPolyline, setPlannedPolyline] = useState<[number, number][]>(
    []
  );
  const [driverPosition, setDriverPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [riderPosition, setRiderPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    page: 0,
    page_size: 10,
    total_pages: 0,
    total_records: 0,
  });
  const [loading, setLoading] = useState(false);
  const trackingSocketRef = useRef<WebSocket | null>(null);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const pickupMarkerRef = useRef<maplibregl.Marker | null>(null);
  const dropoffMarkerRef = useRef<maplibregl.Marker | null>(null);
  const driverMarkerRef = useRef<maplibregl.Marker | null>(null);
  const riderMarkerRef = useRef<maplibregl.Marker | null>(null);

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

  const updateMarker = (
    markerRef: React.MutableRefObject<maplibregl.Marker | null>,
    coord: { lat: number; lng: number } | null,
    color: string
  ) => {
    if (!mapRef.current) return;
    if (!coord) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    const position: LngLatLike = [coord.lng, coord.lat];
    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({ color })
        .setLngLat(position)
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat(position);
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
    if (!map || !mapReady) return;

    if (map.getLayer(id)) {
      map.removeLayer(id);
    }
    if (map.getSource(id)) {
      map.removeSource(id);
    }

    if (!coords || coords.length === 0) return;

    map.addSource(id, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: coords,
        },
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
  };

  const refreshMapLayers = () => {
    renderLineLayer(
      "planned-route",
      plannedPolyline,
      "#94A3B8",
      3,
      0.65,
      [1.5, 1.5]
    );
    renderLineLayer("tracking-route", trackingPolyline, "#2563EB", 4, 0.95);
  };

  const fitMapToMarkers = () => {
    if (!mapRef.current) return;
    const points: LngLatLike[] = [];

    const pickup = normalizeLocation(
      (selectedRideDetail as any)?.start_location ||
        (selectedRideDetail as any)?.startLocation ||
        selectedRide?.pickupLocation
    );
    const dropoff = normalizeLocation(
      (selectedRideDetail as any)?.end_location ||
        (selectedRideDetail as any)?.endLocation ||
        selectedRide?.destination
    );

    if (pickup) points.push([pickup.lng, pickup.lat]);
    if (dropoff) points.push([dropoff.lng, dropoff.lat]);
    if (driverPosition) points.push([driverPosition.lng, driverPosition.lat]);
    if (riderPosition) points.push([riderPosition.lng, riderPosition.lat]);

    const valid = points.filter(
      (p) =>
        Array.isArray(p) && typeof p[0] === "number" && typeof p[1] === "number"
    ) as [number, number][];

    const polylineForBounds =
      trackingPolyline.length > 0 ? trackingPolyline : plannedPolyline;

    if (polylineForBounds.length > 0) {
      valid.push(...polylineForBounds);
    }

    if (valid.length === 0) return;

    const bounds = valid.reduce(
      (b, coord) => b.extend(coord),
      new maplibregl.LngLatBounds(valid[0], valid[0]) as maplibregl.LngLatBounds
    );
    mapRef.current.fitBounds(bounds as LngLatBoundsLike, {
      padding: 40,
      duration: 0,
    });
  };

  const applyTrackingSnapshot = (snapshot: TrackingSnapshot) => {
    if (snapshot.driverLat != null && snapshot.driverLng != null) {
      setDriverPosition({
        lat: Number(snapshot.driverLat),
        lng: Number(snapshot.driverLng),
      });
    }
    if (snapshot.riderLat != null && snapshot.riderLng != null) {
      setRiderPosition({
        lat: Number(snapshot.riderLat),
        lng: Number(snapshot.riderLng),
      });
    }
    if (snapshot.polyline) {
      setTrackingPolyline(decodePolyline(snapshot.polyline));
    }
  };

  const fetchTrackingSnapshot = async (rideId: string) => {
    try {
      const data = await apiFetch<TrackingSnapshot>(
        `/ride-tracking/${rideId}/snapshot`
      );
      if (data) {
        applyTrackingSnapshot(data);
      }
    } catch (error: any) {
      console.warn("Không thể tải tracking snapshot:", error?.message || error);
    }
  };

  const subscribeTracking = async (rideId: string) => {
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

        // STOMP messages: headers\n\nbody\0
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
            });
          } catch (err) {
            console.warn("Không phân tích được dữ liệu tracking:", err);
          }
        }
      };

      ws.onerror = (err) => {
        console.error("Lỗi WebSocket tracking:", err);
      };

      ws.onclose = () => {
        setIsSubscribing(false);
        trackingSocketRef.current = null;
      };
    } catch (error: any) {
      console.error("Không thể kết nối tracking:", error?.message || error);
      setIsSubscribing(false);
    }
  };

  const cleanupTracking = (rideId?: string | null) => {
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
  };

  const formatRawDateTime = (raw?: string) => {
    if (!raw) return "--";
    const parts = raw.replace("T", " ").split(/[ ]+/);
    if (parts.length === 0) return raw;
    const datePart = parts[0];
    const timePart = (parts[1] || "").substring(0, 5); // HH:mm
    const [y, m, d] = datePart.split("-");
    if (y && m && d) {
      return `${d}/${m}/${y} ${timePart ? "lúc " + timePart : ""}`.trim();
    }
    return raw;
  };

  const loadRides = async () => {
    setLoading(true);
    try {
      const res = await rideService.getAllRides(
        currentPage,
        pageSize,
        filterStatus === "all" ? undefined : filterStatus
      );
      const data = (res as any)?.data || (res as any)?.content || [];
      setRides(
        data.map((r: any): Ride => {
          const status = (r.rideStatus ?? "pending")
            .toString()
            .toLowerCase() as Ride["status"];
          const type = (r.requestKind ?? "solo")
            .toString()
            .toLowerCase() as Ride["type"];
          const paymentStatus = (r.paymentStatus ?? "pending")
            .toString()
            .toLowerCase() as Ride["paymentStatus"];
          return {
            id: String(r.rideId ?? r.id ?? ""),
            riderId: String(r.riderName ?? r.riderId ?? "N/A"),
            driverId: String(r.driverName ?? r.driverId ?? "N/A"),
            pickupLocation: {
              lat: r.pickupLat ?? r.pickup_lat ?? 0,
              lng: r.pickupLng ?? r.pickup_lng ?? 0,
              address: r.pickupAddress ?? "N/A",
            },
            destination: {
              lat: r.dropoffLat ?? r.dropoff_lat ?? 0,
              lng: r.dropoffLng ?? r.dropoff_lng ?? 0,
              address: r.dropoffAddress ?? "N/A",
            },
            status,
            type,
            fare: r.totalFare ?? 0,
            distance: r.estimatedDistanceKm ?? 0,
            duration: r.estimatedDurationMinutes ?? 0,
            createdAt: r.createdAt ?? "",
            completedAt: r.completedAt,
            rating: undefined,
            feedback: undefined,
            paymentStatus,
            sharedWith: [],
          };
        })
      );

      const paginationInfo =
        (res as any)?.pagination ||
        (res as any)?.page ||
        (res as any)?.pageable;
      setPagination({
        page:
          paginationInfo?.page ??
          paginationInfo?.pageNumber ??
          (res as any)?.number ??
          currentPage,
        page_size:
          paginationInfo?.page_size ??
          paginationInfo?.size ??
          (res as any)?.size ??
          pageSize,
        total_pages:
          paginationInfo?.total_pages ??
          paginationInfo?.totalPages ??
          (res as any)?.totalPages ??
          1,
        total_records:
          paginationInfo?.total_records ??
          paginationInfo?.totalElements ??
          data.length,
      });
    } catch (error: any) {
      console.error("Failed to load rides:", error);
      toast.error(error?.message || "Không thể tải danh sách chuyến đi");
      setRides([]);
      setPagination({
        page: 0,
        page_size: pageSize,
        total_pages: 0,
        total_records: 0,
      });
    } finally {
      setLoading(false);
    }
  };

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

  const filteredRides = rides.filter((ride) => {
    const matchesStatus =
      filterStatus === "all" || ride.status === filterStatus;
    const matchesType = filterType === "all" || ride.type === filterType;
    return matchesStatus && matchesType;
  });

  const handleCancelRide = (rideId: string) => {
    setRides((prev) =>
      prev.map((ride) =>
        ride.id === rideId ? { ...ride, status: "cancelled" } : ride
      )
    );
    toast.success("Đã hủy chuyến thành công");
  };

  const getStatusBadge = (status: RideStatusDisplay) => {
    const styles: Record<RideStatusDisplay, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      ongoing: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      scheduled: "bg-sky-100 text-sky-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const getTypeBadge = (type: Ride["type"]) => {
    return type === "shared"
      ? "bg-indigo-100 text-indigo-800"
      : "bg-gray-100 text-gray-800";
  };

  const statusLabels: Record<RideStatusDisplay, string> = {
    pending: "Đang chờ",
    accepted: "Đã nhận",
    ongoing: "Đang thực hiện",
    completed: "Đã hoàn thành",
    cancelled: "Đã hủy",
    scheduled: "Đã lên lịch",
  };

  useEffect(() => {
    if (!selectedRide) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
      if (trackingPolyline.length) setTrackingPolyline([]);
      if (plannedPolyline.length) setPlannedPolyline([]);
      setDriverPosition(null);
      setRiderPosition(null);
      pickupMarkerRef.current = null;
      dropoffMarkerRef.current = null;
      driverMarkerRef.current = null;
      riderMarkerRef.current = null;
      setSelectedRideDetail(null);
      return;
    }

    if (!mapRef.current && mapContainerRef.current) {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: goongService.getStyleUrl(),
        center: [
          selectedRide.pickupLocation.lng || 106.809844,
          selectedRide.pickupLocation.lat || 10.84148,
        ],
        zoom: 13,
      });
      map.addControl(new maplibregl.NavigationControl(), "top-right");
      map.on("load", () => setMapReady(true));
      mapRef.current = map;
    }

    if (mapRef.current && selectedRide && mapReady) {
      const pickup = normalizeLocation(
        (selectedRideDetail as any)?.start_location ||
          (selectedRideDetail as any)?.startLocation ||
          selectedRide.pickupLocation
      );
      const dropoff = normalizeLocation(
        (selectedRideDetail as any)?.end_location ||
          (selectedRideDetail as any)?.endLocation ||
          selectedRide.destination
      );
      updateMarker(pickupMarkerRef, pickup, "#10B981");
      updateMarker(dropoffMarkerRef, dropoff, "#EF4444");
      refreshMapLayers();
      fitMapToMarkers();
    }
  }, [
    selectedRide,
    selectedRideDetail,
    mapReady,
    plannedPolyline,
    trackingPolyline,
  ]);

  useEffect(() => {
    if (!selectedRide || !mapRef.current || !mapReady) return;
    updateMarker(driverMarkerRef, driverPosition, "#2563EB");
    updateMarker(riderMarkerRef, riderPosition, "#F59E0B");
    refreshMapLayers();
    fitMapToMarkers();
  }, [driverPosition, riderPosition, trackingPolyline, selectedRide, mapReady]);

  useEffect(() => {
    const rideId = selectedRide?.id;
    if (!rideId) {
      cleanupTracking();
      return;
    }

    setTrackingPolyline([]);
    setPlannedPolyline([]);
    setDriverPosition(null);
    setRiderPosition(null);

    // Load fresh ride details for modal
    rideService
      .getRideById(rideId)
      .then((detail: any) => {
        setSelectedRideDetail(detail);
        const encodedRoute =
          pickValue(detail?.route || {}, ["polyline"]) ||
          pickValue(detail, ["route_polyline", "polyline"]);
        setPlannedPolyline(decodePolyline(encodedRoute));
        const startLoc = detail?.start_location || detail?.startLocation;
        const endLoc = detail?.end_location || detail?.endLocation;
        if (startLoc || endLoc) {
          setRides((prev) =>
            prev.map((r) =>
              r.id === rideId
                ? {
                    ...r,
                    pickupLocation: {
                      lat:
                        startLoc?.lat ??
                        startLoc?.latitude ??
                        r.pickupLocation.lat,
                      lng:
                        startLoc?.lng ??
                        startLoc?.longitude ??
                        r.pickupLocation.lng,
                      address:
                        startLoc?.name ??
                        startLoc?.address ??
                        r.pickupLocation.address,
                    },
                    destination: {
                      lat: endLoc?.lat ?? endLoc?.latitude ?? r.destination.lat,
                      lng:
                        endLoc?.lng ?? endLoc?.longitude ?? r.destination.lng,
                      address:
                        endLoc?.name ??
                        endLoc?.address ??
                        r.destination.address,
                    },
                  }
                : r
            )
          );
        }
      })
      .catch(() => {
        setSelectedRideDetail(null);
      });

    if (selectedRide.status === "ongoing") {
      fetchTrackingSnapshot(rideId);
      subscribeTracking(rideId);
      if (trackingIntervalRef.current)
        clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = setInterval(
        () => fetchTrackingSnapshot(rideId),
        15000
      );
    } else {
      cleanupTracking(rideId);
      // Still load snapshot once for static view
      fetchTrackingSnapshot(rideId);
      setDriverPosition(null);
      setRiderPosition(null);
    }

    return () => {
      cleanupTracking(rideId);
    };
  }, [selectedRide]);

  useEffect(() => {
    loadRides();
  }, [filterStatus, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(0);
  }, [filterType, filterStatus]);

  const typeLabels: Partial<Record<Ride["type"], string>> = {
    shared: "Đi chung",
  };

  const rideDetail = selectedRideDetail || {};
  const rideStatus = normalizeRideStatus(
    rideDetail?.status || selectedRide?.status
  );
  const startLocation =
    normalizeLocation(
      rideDetail?.start_location || rideDetail?.startLocation
    ) || normalizeLocation(selectedRide?.pickupLocation);
  const endLocation =
    normalizeLocation(rideDetail?.end_location || rideDetail?.endLocation) ||
    normalizeLocation(selectedRide?.destination);
  const routeInfo = rideDetail?.route || rideDetail?.route_summary || null;
  const driverName =
    pickValue(rideDetail, ["driver_name", "driverName"]) ||
    selectedRide?.driverId;
  const driverRating = pickValue(rideDetail, ["driver_rating", "driverRating"]);
  const vehicleModel = pickValue(rideDetail, ["vehicle_model", "vehicleModel"]);
  const vehiclePlate = pickValue(rideDetail, ["vehicle_plate", "vehiclePlate"]);
  const estimatedDistance =
    pickValue(rideDetail, ["estimated_distance", "estimatedDistance"]) ??
    selectedRide?.distance;
  const estimatedDuration =
    pickValue(rideDetail, ["estimated_duration", "estimatedDuration"]) ??
    selectedRide?.duration;
  const actualDistance = pickValue(rideDetail, [
    "actual_distance",
    "actualDistance",
  ]);
  const actualDuration = pickValue(rideDetail, [
    "actual_duration",
    "actualDuration",
  ]);
  const baseFare = pickValue(rideDetail, ["base_fare", "baseFare"]);
  const perKmRate = pickValue(rideDetail, ["per_km_rate", "perKmRate"]);
  const totalFare =
    selectedRide?.fare ??
    pickValue(rideDetail, ["total_fare", "fare", "base_fare"]);
  const scheduledTime = pickValue(rideDetail, [
    "scheduled_time",
    "scheduledTime",
  ]);
  const startedAt = pickValue(rideDetail, ["started_at", "startedAt"]);
  const completedAt =
    pickValue(rideDetail, ["completed_at", "completedAt"]) ??
    selectedRide?.completedAt;
  const createdAt =
    pickValue(rideDetail, ["created_at", "createdAt"]) ??
    selectedRide?.createdAt;
  const driverApproachEta = pickValue(rideDetail, [
    "driver_approach_eta",
    "driverApproachEta",
  ]);
  const driverApproachDistance = pickValue(rideDetail, [
    "driver_approach_distance_meters",
    "driverApproachDistanceMeters",
  ]);
  const driverApproachDuration = pickValue(rideDetail, [
    "driver_approach_duration_seconds",
    "driverApproachDurationSeconds",
  ]);
  const activePolylineLabel =
    trackingPolyline.length > 0 ? "Lộ trình thực tế" : "Lộ trình dự kiến";
  const totalPages = pagination.total_pages || 0;
  const totalRecords = pagination.total_records || rides.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý chuyến đi chia sẻ
          </h1>
          <p className="mt-2 text-gray-600">Theo dõi chuyến đi</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {[
          {
            label: "Tổng số chuyến",
            value: rides.length,
            color: "bg-blue-500",
            icon: MapPinIcon,
          },
          {
            label: "Đang thực hiện",
            value: rides.filter((r) => r.status === "ongoing").length,
            color: "bg-purple-500",
            icon: ClockIcon,
          },
          {
            label: "Tổng doanh thu",
            value: `${rides
              .filter((r) => r.status === "completed")
              .reduce((sum, r) => sum + r.fare, 0)
              .toLocaleString("vi-VN")}đ`,
            color: "bg-yellow-500",
            icon: CurrencyDollarIcon,
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card h-full flex flex-col"
          >
            <div className="flex items-center flex-1">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <select
            className="input-field"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="SCHEDULED">Đã lên lịch</option>
            <option value="ONGOING">Đang thực hiện</option>
            <option value="COMPLETED">Đã hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </motion.div>

      {/* Rides Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin chuyến
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành khách & Tài xế
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lộ trình
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doanh thu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRides.map((ride) => (
                <tr
                  key={ride.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{ride.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatRawDateTime(ride.createdAt)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {ride.distance}km • {ride.duration} phút
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Hành khách: {ride.riderId || "—"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Tài xế: {ride.driverId || "—"}
                      </div>
                      {ride.sharedWith && ride.sharedWith.length > 0 && (
                        <div className="text-xs text-blue-600">
                          +{ride.sharedWith.length} hành khách
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="flex items-center text-sm text-gray-900 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="truncate">
                          {ride.pickupLocation.address}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-900">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <span className="truncate">
                          {ride.destination.address}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          ride.status
                        )}`}
                      >
                        {statusLabels[ride.status]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {ride.fare.toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedRide(ride)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {(ride.status === "pending" ||
                        ride.status === "accepted") && (
                        <button
                          onClick={() => handleCancelRide(ride.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Hủy chuyến"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRides.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy chuyến đi phù hợp.</p>
          </div>
        )}

        {filteredRides.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            loading={loading}
            className="border-t border-gray-100"
          />
        )}
      </motion.div>

      {/* Ride Detail Modal */}
      {selectedRide && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Chi tiết chuyến #{selectedRide.id}
                    </h3>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                        rideStatus
                      )}`}
                    >
                      {statusLabels[rideStatus] || rideStatus}
                    </span>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getTypeBadge(
                        selectedRide.type
                      )}`}
                    >
                      {typeLabels[selectedRide.type]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Tạo lúc {formatDateTime(createdAt)} •{" "}
                    {routeInfo?.name || "Tuyến tùy chỉnh"}
                  </p>
                  {routeInfo?.code && (
                    <p className="text-xs text-gray-400">
                      Mã tuyến: {routeInfo.code}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Quãng đường</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDistance(actualDistance || estimatedDistance)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Thời gian</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDurationMinutes(
                        actualDuration || estimatedDuration
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRide(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Lộ trình",
                    value: formatDistance(estimatedDistance),
                    sub: routeInfo?.name || "Dữ liệu OSRM",
                    icon: MapIcon,
                    accent: "bg-sky-100 text-sky-700",
                  },
                  {
                    label: "Thời gian dự kiến",
                    value: formatDurationMinutes(estimatedDuration),
                    icon: ClockIcon,
                    accent: "bg-amber-100 text-amber-700",
                  },
                  {
                    label: "Doanh thu",
                    value: formatCurrency(totalFare),
                    icon: CurrencyDollarIcon,
                    accent: "bg-emerald-100 text-emerald-700",
                  },
                  {
                    label: "Lịch trình",
                    value: formatDateTime(
                      scheduledTime || startedAt || createdAt
                    ),
                    sub: startedAt
                      ? `Bắt đầu: ${formatDateTime(startedAt)}`
                      : "Chưa khởi hành",
                    icon: CalendarDaysIcon,
                    accent: "bg-indigo-100 text-indigo-700",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-4 bg-gray-50 rounded-lg flex gap-3 items-start"
                  >
                    <div className={`p-2 rounded-lg ${item.accent}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="font-semibold text-gray-900">
                        {item.value}
                      </p>
                      {item.sub && (
                        <p className="text-xs text-gray-500 mt-1">{item.sub}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-4">
                  <div className="card border border-sky-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapIcon className="h-5 w-5 text-sky-600" />
                        <h4 className="font-medium text-gray-900">Lộ trình</h4>
                      </div>
                      <span className="text-xs text-gray-500">
                        {activePolylineLabel}
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                          <MapPinIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            Điểm đón
                          </p>
                          <p className="text-sm text-gray-600">
                            {startLocation?.name || "Chưa cập nhật"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700">
                          <FlagIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            Điểm đến
                          </p>
                          <p className="text-sm text-gray-600">
                            {endLocation?.name || "Chưa cập nhật"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <UserIcon className="h-5 w-5 text-gray-600" />
                      <h4 className="font-medium text-gray-900">
                        Người tham gia & xe
                      </h4>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Hành khách</p>
                        <p className="font-semibold text-gray-900">
                          {selectedRide.riderId}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tài xế</p>
                        <p className="font-semibold text-gray-900">
                          {driverName}
                        </p>
                        {driverRating && (
                          <p className="text-xs text-amber-600 mt-1">
                            Đánh giá: {Number(driverRating).toFixed(1)}
                          </p>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <TruckIcon className="h-4 w-4" />
                          <span>Phương tiện</span>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {vehicleModel || "—"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {vehiclePlate || ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center gap-2 mb-3">
                      <ClockIcon className="h-5 w-5 text-gray-600" />
                      <h4 className="font-medium text-gray-900">
                        Mốc thời gian
                      </h4>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Lên lịch</p>
                        <p className="font-semibold text-gray-900">
                          {formatDateTime(scheduledTime || createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Bắt đầu</p>
                        <p className="font-semibold text-gray-900">
                          {formatDateTime(startedAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Hoàn thành</p>
                        <p className="font-semibold text-gray-900">
                          {formatDateTime(completedAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Thời gian ước tính đến điểm đón
                        </p>
                        <p className="font-semibold text-gray-900">
                          {formatDateTime(driverApproachEta)}
                        </p>
                        {(driverApproachDistance || driverApproachDuration) && (
                          <p className="text-xs text-gray-500">
                            {driverApproachDistance
                              ? `${
                                  Math.round(
                                    Number(driverApproachDistance) / 100
                                  ) / 10
                                } km`
                              : ""}
                            {driverApproachDistance && driverApproachDuration
                              ? " • "
                              : ""}
                            {driverApproachDuration
                              ? `${Math.round(
                                  Number(driverApproachDuration) / 60
                                )} phút`
                              : ""}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500">Ước tính</p>
                        <p className="font-semibold text-gray-900">
                          {formatDistance(estimatedDistance)} •{" "}
                          {formatDurationMinutes(estimatedDuration)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Thực tế</p>
                        <p className="font-semibold text-gray-900">
                          {formatDistance(actualDistance || estimatedDistance)}{" "}
                          •{" "}
                          {formatDurationMinutes(
                            actualDuration || estimatedDuration
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapIcon className="h-5 w-5 text-sky-600" />
                      <h4 className="font-medium text-gray-900">
                        Định vị & Theo dõi
                      </h4>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {rideStatus === "ongoing"
                        ? "Đang cập nhật"
                        : "Chế độ xem tĩnh"}
                    </span>
                  </div>
                  <div className="h-80 rounded-lg overflow-hidden border border-gray-200">
                    <div ref={mapContainerRef} className="w-full h-full" />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-green-500" />{" "}
                      Điểm đón
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-red-500" /> Điểm
                      đến
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-[3px] rounded-full bg-slate-400" />{" "}
                      Lộ trình dự kiến
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-[3px] rounded-full bg-blue-500" />{" "}
                      Lộ trình cập nhật
                    </div>
                    {rideStatus === "ongoing" && (
                      <>
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-blue-600" />{" "}
                          Tài xế
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-amber-500" />{" "}
                          Khách
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {selectedRide.status === "completed" && selectedRide.rating && (
                <div className="card bg-amber-50 border border-amber-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Đánh giá</h4>
                      {selectedRide.feedback && (
                        <p className="text-sm text-gray-700 mt-1">
                          "{selectedRide.feedback}"
                        </p>
                      )}
                    </div>
                    <div className="text-amber-600 font-semibold text-lg">
                      {selectedRide.rating} ⭐
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedRide(null)}
                className="btn-secondary"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
