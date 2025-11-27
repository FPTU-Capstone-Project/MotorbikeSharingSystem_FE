import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import toast from 'react-hot-toast';
import { EyeIcon } from '@heroicons/react/24/outline';
import routeAdminService from '../services/routeAdminService';
import { goongService, PlaceSuggestion } from '../services/goongService';
import Pagination from '../components/Pagination';
import {
  CreateRouteTemplatePayload,
  LatLng,
  PricingContext,
  RouteTemplate,
  PoiLocation,
} from '../types/routes.types';

const INITIAL_CENTER: [number, number] = [106.809844, 10.84148];
const PAGE_SIZE_OPTIONS = [5, 10, 20];

const decodePolyline = (encoded: string): LatLng[] => {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
};

const renderRoutePolyline = (
  map: MapLibreMap | null,
  sourceId: string,
  layerId: string,
  encodedPolyline?: string | null
) => {
  if (!map) {
    return;
  }

  const draw = () => {
    if (!map) {
      return;
    }
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }
    if (!encodedPolyline) {
      return;
    }

    const decoded = decodePolyline(encodedPolyline);
    if (decoded.length < 2) {
      return;
    }
    const coordinates = decoded.map((point) => [point.longitude, point.latitude]);

    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates,
        },
        properties: {},
      },
    });

    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#2563eb',
        'line-width': 4,
        'line-opacity': 0.85,
      },
    });

    const bounds = coordinates.reduce(
      (acc, coord) => acc.extend(coord as [number, number]),
      new maplibregl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number])
    );
    map.fitBounds(bounds, { padding: 40, duration: 0 });
  };

  if (!map.isStyleLoaded()) {
    map.once('load', draw);
  } else {
    draw();
  }
};

const RouteManagement: React.FC = () => {
  const [routes, setRoutes] = useState<RouteTemplate[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteTemplate | null>(null);

  const [pricingContext, setPricingContext] = useState<PricingContext | null>(null);
  const [routeName, setRouteName] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [fromPoint, setFromPoint] = useState<LatLng | null>(null);
  const [toPoint, setToPoint] = useState<LatLng | null>(null);
  const [fromLabel, setFromLabel] = useState('');
  const [toLabel, setToLabel] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [selectionMode, setSelectionMode] = useState<'from' | 'to'>('from');
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState<PlaceSuggestion[]>([]);
  const [toSuggestions, setToSuggestions] = useState<PlaceSuggestion[]>([]);
  const [pricePreview, setPricePreview] = useState<RouteTemplate | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [creatingRoute, setCreatingRoute] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [poiLocations, setPoiLocations] = useState<PoiLocation[]>([]);
  const [loadingPois, setLoadingPois] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const fromMarkerRef = useRef<maplibregl.Marker | null>(null);
  const toMarkerRef = useRef<maplibregl.Marker | null>(null);
  const detailMapContainerRef = useRef<HTMLDivElement | null>(null);
  const detailMapRef = useRef<MapLibreMap | null>(null);
  const detailFromMarkerRef = useRef<maplibregl.Marker | null>(null);
  const detailToMarkerRef = useRef<maplibregl.Marker | null>(null);

  const fetchRoutes = useCallback(async () => {
    try {
      setLoadingRoutes(true);
      const response = await routeAdminService.listRoutes({
        page: currentPage,
        size: pageSize,
      });
      setRoutes(response.data ?? []);
      setTotalPages(response.pagination?.total_pages ?? 1);
      setTotalRecords(response.pagination?.total_records ?? 0);
    } catch (error: any) {
      toast.error(error?.message || 'Không thể tải danh sách tuyến đường');
    } finally {
      setLoadingRoutes(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  useEffect(() => {
    routeAdminService
      .getPricingContext()
      .then(setPricingContext)
      .catch((error) => toast.error(error?.message || 'Không thể tải cấu hình giá hiện hành'));
  }, []);

  useEffect(() => {
    const fetchPois = async () => {
      try {
        setLoadingPois(true);
        const pois = await routeAdminService.getPoiLocations();
        setPoiLocations(pois ?? []);
      } catch (error: any) {
        toast.error(error?.message || 'Không thể tải danh sách địa điểm gợi ý');
      } finally {
        setLoadingPois(false);
      }
    };
    fetchPois();
  }, []);

  useEffect(() => {
    if (!createModalOpen) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        fromMarkerRef.current = null;
        toMarkerRef.current = null;
      }
      return;
    }

    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: goongService.getStyleUrl(),
      center: INITIAL_CENTER,
      zoom: 14,
    });
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.on('click', (event: maplibregl.MapMouseEvent) => {
      handleLocationPicked(event.lngLat.lat, event.lngLat.lng);
    });
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      fromMarkerRef.current = null;
      toMarkerRef.current = null;
    };
  }, [createModalOpen]);

  useEffect(() => {
    updateMarker(fromPoint, fromMarkerRef, '#16a34a');
  }, [fromPoint]);

  useEffect(() => {
    updateMarker(toPoint, toMarkerRef, '#1d4ed8');
  }, [toPoint]);

  useEffect(() => {
    if (!createModalOpen || !fromPoint || !toPoint) {
      setPricePreview(null);
      renderRoutePolyline(mapRef.current, 'create-route-source', 'create-route-layer', null);
      return;
    }
    const payload = buildPayload(false);
    if (!payload) return;
    setPreviewLoading(true);
    const timer = setTimeout(async () => {
      try {
        const preview = await routeAdminService.previewRoute(payload);
        setPricePreview(preview);
        renderRoutePolyline(
          mapRef.current,
          'create-route-source',
          'create-route-layer',
          preview?.polyline
        );
      } catch (error: any) {
        toast.error(error?.message || 'Không thể tính giá tuyến đường');
        setPricePreview(null);
        renderRoutePolyline(mapRef.current, 'create-route-source', 'create-route-layer', null);
      } finally {
        setPreviewLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [createModalOpen, fromPoint, toPoint, routeName, validFrom, validUntil]);

  const updateMarker = (
    point: LatLng | null,
    markerRef: React.MutableRefObject<maplibregl.Marker | null>,
    color: string,
    mapInstance?: MapLibreMap | null
  ) => {
    const map = mapInstance ?? mapRef.current;
    if (!map) return;
    if (!point) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({ color })
        .setLngLat([point.longitude, point.latitude])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([point.longitude, point.latitude]);
    }
  };

  const handleLocationPicked = async (lat: number, lng: number) => {
    if (selectionMode === 'from') {
      setFromPoint({ latitude: lat, longitude: lng });
    } else {
      setToPoint({ latitude: lat, longitude: lng });
    }

    try {
      const address = await goongService.reverseGeocode(lat, lng);
      if (selectionMode === 'from') {
        setFromAddress(address || '');
        if (!fromLabel) {
          setFromLabel(address || 'Điểm đi');
        }
        setFromSearch(address || '');
      } else {
        setToAddress(address || '');
        if (!toLabel) {
          setToLabel(address || 'Điểm đến');
        }
        setToSearch(address || '');
      }
    } catch (error) {
      console.warn('Reverse geocode failed', error);
    }
  };

  const debounceSearch = (
    query: string,
    setter: React.Dispatch<React.SetStateAction<PlaceSuggestion[]>>
  ) => {
    if (!query || query.trim().length < 3) {
      setter([]);
      return () => {};
    }
    const handler = setTimeout(async () => {
      const results = await goongService.searchPlaces(query);
      setter(results);
    }, 350);
    return () => clearTimeout(handler);
  };

  useEffect(() => debounceSearch(fromSearch, setFromSuggestions), [fromSearch]);
  useEffect(() => debounceSearch(toSearch, setToSuggestions), [toSearch]);

  const handleSuggestionSelect = async (type: 'from' | 'to', suggestion: PlaceSuggestion) => {
    try {
      const detail = await goongService.getPlaceDetails(suggestion.placeId);
      if (!detail) return;
      const coords = { latitude: detail.latitude, longitude: detail.longitude };
      if (type === 'from') {
        setFromPoint(coords);
        setFromAddress(detail.formattedAddress);
        setFromLabel(detail.name);
        setFromSearch(detail.formattedAddress);
        setFromSuggestions([]);
      } else {
        setToPoint(coords);
        setToAddress(detail.formattedAddress);
        setToLabel(detail.name);
        setToSearch(detail.formattedAddress);
        setToSuggestions([]);
      }
      mapRef.current?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 16 });
    } catch (error: any) {
      toast.error(error?.message || 'Không thể lấy thông tin địa điểm');
    }
  };

  const handlePoiSelection = (type: 'from' | 'to', poi: PoiLocation) => {
    const coords = { latitude: poi.lat, longitude: poi.lng };
    if (type === 'from') {
      setFromPoint(coords);
      setFromAddress(poi.address);
      setFromLabel(poi.name);
      setFromSearch(poi.name);
      setSelectionMode('to');
    } else {
      setToPoint(coords);
      setToAddress(poi.address);
      setToLabel(poi.name);
      setToSearch(poi.name);
    }
  };

  const renderPoiQuickList = (type: 'from' | 'to') => {
    if (loadingPois) {
      return <p className="text-xs text-gray-400">Đang tải địa điểm gợi ý...</p>;
    }
    if (!poiLocations.length) {
      return null;
    }

    const selectedName = type === 'from' ? fromLabel : toLabel;

    return (
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-500">Địa điểm phổ biến</p>
        <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
          {poiLocations.map((poi) => {
            const isActive = selectedName && poi.name === selectedName;
            return (
              <button
                key={`${type}-${poi.locationId}`}
                type="button"
                className={`px-3 py-1 rounded-full border text-xs ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => handlePoiSelection(type, poi)}
              >
                {poi.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const buildPayload = (includeDates = true): CreateRouteTemplatePayload | null => {
    if (!fromPoint || !toPoint) {
      return null;
    }
    const payload: CreateRouteTemplatePayload = {
      name: routeName.trim() || 'Tuyến chưa đặt tên',
      from: {
        coordinates: { latitude: fromPoint.latitude, longitude: fromPoint.longitude },
        label: fromLabel || undefined,
        address: fromAddress || undefined,
      },
      to: {
        coordinates: { latitude: toPoint.latitude, longitude: toPoint.longitude },
        label: toLabel || undefined,
        address: toAddress || undefined,
      },
    };
    if (includeDates) {
      payload.validFrom = validFrom || undefined;
      payload.validUntil = validUntil || undefined;
    }
    return payload;
  };

  const resetForm = () => {
    setRouteName('');
    setValidFrom('');
    setValidUntil('');
    setFromPoint(null);
    setToPoint(null);
    setFromLabel('');
    setToLabel('');
    setFromAddress('');
    setToAddress('');
    setFromSearch('');
    setToSearch('');
    setSelectionMode('from');
    setPricePreview(null);
    setFormErrors([]);
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!routeName.trim()) errors.push('Tên tuyến đường là bắt buộc');
    if (!fromPoint) errors.push('Vui lòng chọn điểm đi');
    if (!toPoint) errors.push('Vui lòng chọn điểm đến');
    if (validFrom && validUntil && new Date(validUntil) <= new Date(validFrom)) {
      errors.push('Thời gian kết thúc phải sau thời gian bắt đầu');
    }
    setFormErrors(errors);
    if (errors.length) {
      toast.error(errors[0]);
    }
    return errors.length === 0;
  };

  const handleCreateRoute = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;
    const payload = buildPayload(true);
    if (!payload) return;
    try {
      setCreatingRoute(true);
      await routeAdminService.createRoute(payload);
      toast.success('Tạo tuyến đường thành công');
      setCreateModalOpen(false);
      resetForm();
      fetchRoutes();
    } catch (error: any) {
      toast.error(error?.message || 'Không thể tạo tuyến đường');
    } finally {
      setCreatingRoute(false);
    }
  };

  const updateDetailMap = useCallback((route: RouteTemplate | null) => {
    const map = detailMapRef.current;
    if (!map) {
      return;
    }

    const fromPointRoute =
      route?.from?.latitude != null && route?.from?.longitude != null
        ? { latitude: route.from.latitude, longitude: route.from.longitude }
        : null;
    const toPointRoute =
      route?.to?.latitude != null && route?.to?.longitude != null
        ? { latitude: route.to.latitude, longitude: route.to.longitude }
        : null;

    updateMarker(fromPointRoute, detailFromMarkerRef, '#16a34a', map);
    updateMarker(toPointRoute, detailToMarkerRef, '#1d4ed8', map);

    if (route?.polyline) {
      renderRoutePolyline(map, 'detail-route-source', 'detail-route-layer', route.polyline);
    } else {
      renderRoutePolyline(map, 'detail-route-source', 'detail-route-layer', null);
      const points = [fromPointRoute, toPointRoute].filter(Boolean) as LatLng[];
      if (points.length > 0) {
        const bounds = new maplibregl.LngLatBounds(
          [points[0].longitude, points[0].latitude],
          [points[0].longitude, points[0].latitude]
        );
        points.slice(1).forEach((point) => bounds.extend([point.longitude, point.latitude]));
        map.fitBounds(bounds, { padding: 40, duration: 0 });
      }
    }
  }, []);

  useEffect(() => {
    if (!detailModalOpen) {
      if (detailMapRef.current) {
        detailMapRef.current.remove();
        detailMapRef.current = null;
        detailFromMarkerRef.current = null;
        detailToMarkerRef.current = null;
      }
      return;
    }

    if (!detailMapRef.current && detailMapContainerRef.current) {
      const map = new maplibregl.Map({
        container: detailMapContainerRef.current,
        style: goongService.getStyleUrl(),
        center: INITIAL_CENTER,
        zoom: 13,
      });
      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      detailMapRef.current = map;
    }

    if (detailMapRef.current && selectedRoute) {
      updateDetailMap(selectedRoute);
    }
  }, [detailModalOpen, selectedRoute, updateDetailMap]);

  const handleOpenDetail = async (routeId?: number) => {
    if (!routeId) return;
    try {
      const detail = await routeAdminService.getRouteDetail(routeId);
      setSelectedRoute(detail);
      setDetailModalOpen(true);
    } catch (error: any) {
      toast.error(error?.message || 'Không thể tải chi tiết tuyến đường');
    }
  };

  useEffect(() => {
    if (detailModalOpen && selectedRoute) {
      updateDetailMap(selectedRoute);
    }
  }, [detailModalOpen, selectedRoute, updateDetailMap]);

  const priceValue = useMemo(() => {
    if (!pricePreview) return '';
    const amount = pricePreview.pricingPreview?.total ?? pricePreview.defaultPrice;
    if (!amount) return '';
    return new Intl.NumberFormat('vi-VN').format(amount);
  }, [pricePreview]);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => setPageSize(size);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lí tuyến đường</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Quản lí các tuyến đường dùng trong ứng dụng
          </p>
        </div>
        <button className="btn-primary" onClick={() => { resetForm(); setCreateModalOpen(true); }}>
          + Tuyến đường mới
        </button>
      </div>

      <div className="card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Danh sách tuyến đường</h3>
          <p className="text-sm text-gray-500">Giá mặc định được tính tự động từ cấu hình giá.</p>
        </div>

        {loadingRoutes ? (
          <div className="py-10 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : routes.length === 0 ? (
          <div className="py-10 text-center text-gray-500">Chưa có tuyến đường mẫu nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500">
                  <th className="px-4 py-2">Tuyến đường</th>
                  <th className="px-4 py-2">Giá mặc định</th>
                  <th className="px-4 py-2">Hiệu lực</th>
                  <th className="px-4 py-2 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route.routeId ?? route.name} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 dark:text-white">{route.name}</div>
                      <div className="text-xs text-gray-500">
                        {(route.from?.name || 'Điểm đi')} → {(route.to?.name || 'Điểm đến')}
                      </div>
                      {route.distanceMeters && (
                        <div className="text-xs text-gray-400">{(route.distanceMeters / 1000).toFixed(2)} km</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {route.defaultPrice ? `${route.defaultPrice.toLocaleString('vi-VN')} đ` : '--'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {route.validFrom ? new Date(route.validFrom).toLocaleDateString('vi-VN') : '--'}
                      <br />
                      {route.validUntil ? `Đến ${new Date(route.validUntil).toLocaleDateString('vi-VN')}` : 'Không giới hạn'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        onClick={() => handleOpenDetail(route.routeId)}
                        aria-label="Xem chi tiết"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loadingRoutes}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            className="bg-transparent px-0 py-0 border-0"
          />
        </div>
      </div>
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Tạo tuyến đường mới</h3>
              <button className="text-gray-500" onClick={() => { setCreateModalOpen(false); resetForm(); }}>✕</button>
            </div>
            <form onSubmit={handleCreateRoute} className="p-6 space-y-6">
              {formErrors.length > 0 && (
                <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{formErrors[0]}</div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Tên tuyến</label>
                    <input
                      className="input-field"
                      value={routeName}
                      onChange={(e) => setRouteName(e.target.value)}
                      placeholder="Ví dụ: KTX → FPT"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="form-label">Hiệu lực từ</label>
                      <input type="datetime-local" className="input-field" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">Hiệu lực đến</label>
                      <input type="datetime-local" className="input-field" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-600">Phiên bản giá</span>
                      {pricingContext && (
                        <span className="text-xs text-gray-500">
                          {new Date(pricingContext.version).toLocaleString('vi-VN')}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="form-label">Giá mặc định (tự động)</label>
                      <input
                        className="input-field bg-gray-100 dark:bg-slate-800 cursor-not-allowed"
                        readOnly
                        value={priceValue ? `${priceValue} đ` : ''}
                        placeholder="Chưa có dữ liệu"
                      />
                      {previewLoading && <p className="text-xs text-gray-500 mt-1">Đang tính...</p>}
                      {pricePreview?.distanceMeters && (
                        <p className="text-xs text-gray-500 mt-1">
                          {(pricePreview.distanceMeters / 1000).toFixed(2)} km · {Math.round((pricePreview.durationSeconds ?? 0) / 60)} phút
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${selectionMode === 'from' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                      onClick={() => setSelectionMode('from')}
                    >
                      Chọn điểm đi
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${selectionMode === 'to' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}
                      onClick={() => setSelectionMode('to')}
                    >
                      Chọn điểm đến
                    </button>
                    <span className="text-sm text-gray-500">Nhấp bản đồ hoặc tìm kiếm để chọn</span>
                  </div>
                  <div className="relative h-72 rounded-xl overflow-hidden border border-slate-200">
                    <div
                      ref={mapContainerRef}
                      className="absolute inset-0 w-full h-full"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-lg shadow px-3 py-2 text-xs text-slate-700 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-green-600" />
                        <span>Điểm đi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                        <span>Điểm đến</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-0.5 w-6 bg-blue-500 rounded-full" />
                        <span>Tuyến đường</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="form-label">Tìm kiếm điểm đi</label>
                      <input
                        className="input-field"
                        value={fromSearch}
                        onChange={(e) => setFromSearch(e.target.value)}
                        placeholder="Nhập địa điểm"
                      />
                      {fromSuggestions.length > 0 && (
                        <div className="bg-white border rounded-lg shadow max-h-40 overflow-y-auto">
                          {fromSuggestions.map((suggestion) => (
                            <button
                              type="button"
                              key={suggestion.placeId}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                              onClick={() => handleSuggestionSelect('from', suggestion)}
                            >
                              {suggestion.description}
                            </button>
                          ))}
                        </div>
                      )}
                      <input
                        className="input-field"
                        value={fromLabel}
                        onChange={(e) => setFromLabel(e.target.value)}
                        placeholder="Tên hiển thị điểm đi"
                      />
                      <input
                        className="input-field"
                        value={fromAddress}
                        onChange={(e) => setFromAddress(e.target.value)}
                        placeholder="Địa chỉ điểm đi"
                      />
                      {renderPoiQuickList('from')}
                    </div>
                    <div className="space-y-2">
                      <label className="form-label">Tìm kiếm điểm đến</label>
                      <input
                        className="input-field"
                        value={toSearch}
                        onChange={(e) => setToSearch(e.target.value)}
                        placeholder="Nhập địa điểm"
                      />
                      {toSuggestions.length > 0 && (
                        <div className="bg-white border rounded-lg shadow max-h-40 overflow-y-auto">
                          {toSuggestions.map((suggestion) => (
                            <button
                              type="button"
                              key={suggestion.placeId}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                              onClick={() => handleSuggestionSelect('to', suggestion)}
                            >
                              {suggestion.description}
                            </button>
                          ))}
                        </div>
                      )}
                      <input
                        className="input-field"
                        value={toLabel}
                        onChange={(e) => setToLabel(e.target.value)}
                        placeholder="Tên hiển thị điểm đến"
                      />
                      <input
                        className="input-field"
                        value={toAddress}
                        onChange={(e) => setToAddress(e.target.value)}
                        placeholder="Địa chỉ điểm đến"
                      />
                      {renderPoiQuickList('to')}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" className="btn-secondary" onClick={() => { setCreateModalOpen(false); resetForm(); }}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={creatingRoute}>
                  {creatingRoute ? 'Đang lưu...' : 'Lưu tuyến đường'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {detailModalOpen && selectedRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Chi tiết tuyến đường</h3>
              <button className="text-gray-500" onClick={() => setDetailModalOpen(false)}>✕</button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="relative h-64 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                <div ref={detailMapContainerRef} className="absolute inset-0 w-full h-full" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-lg shadow px-3 py-2 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-600" />
                    <span>Điểm đi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    <span>Điểm đến</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-0.5 w-6 bg-blue-500 rounded-full" />
                    <span>Tuyến đường</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tên tuyến</p>
                <p className="text-base font-semibold">{selectedRoute.name}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40">
                  <p className="text-xs text-gray-500">Điểm đi</p>
                  <p className="font-semibold">{selectedRoute.from?.name}</p>
                  <p className="text-xs text-gray-500">{selectedRoute.from?.address}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40">
                  <p className="text-xs text-gray-500">Điểm đến</p>
                  <p className="font-semibold">{selectedRoute.to?.name}</p>
                  <p className="text-xs text-gray-500">{selectedRoute.to?.address}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Quãng đường</p>
                  <p className="font-semibold">
                    {selectedRoute.distanceMeters ? `${(selectedRoute.distanceMeters / 1000).toFixed(2)} km` : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Thời gian</p>
                  <p className="font-semibold">
                    {selectedRoute.durationSeconds ? `${Math.round((selectedRoute.durationSeconds ?? 0) / 60)} phút` : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Giá mặc định</p>
                  <p className="font-semibold">
                    {selectedRoute.defaultPrice ? `${selectedRoute.defaultPrice.toLocaleString('vi-VN')} đ` : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phiên bản giá</p>
                  <p className="font-semibold">
                    {selectedRoute.pricingPreview?.pricingVersion
                      ? new Date(selectedRoute.pricingPreview.pricingVersion).toLocaleString('vi-VN')
                      : '--'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Hiệu lực từ</p>
                  <p className="font-semibold">
                    {selectedRoute.validFrom ? new Date(selectedRoute.validFrom).toLocaleString('vi-VN') : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hiệu lực đến</p>
                  <p className="font-semibold">
                    {selectedRoute.validUntil ? new Date(selectedRoute.validUntil).toLocaleString('vi-VN') : 'Không giới hạn'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteManagement;
