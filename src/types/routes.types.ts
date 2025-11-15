export type RouteType = 'TEMPLATE' | 'CUSTOM';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface RouteEndpoint {
  locationId?: number;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isPoi?: boolean;
}

export interface RoutePricingPreview {
  pricingVersion?: string;
  subtotal?: number;
  discount?: number;
  total?: number;
  commissionRate?: number;
}

export interface RouteTemplate {
  routeId?: number;
  name: string;
  routeType?: RouteType;
  from?: RouteEndpoint;
  to?: RouteEndpoint;
  defaultPrice?: number;
  distanceMeters?: number;
  durationSeconds?: number;
  polyline?: string;
  validFrom?: string;
  validUntil?: string;
  createdAt?: string;
  updatedAt?: string;
  pricingPreview?: RoutePricingPreview;
}

export interface FareTierInfo {
  tierLevel?: number;
  minKm?: number;
  maxKm?: number;
  amount?: number;
  description?: string;
}

export interface PricingContext {
  pricingConfigId: number;
  version: string;
  validFrom: string;
  validUntil?: string;
  systemCommissionRate: number;
  fareTiers: FareTierInfo[];
}

export interface RouteEndpointPayload {
  locationId?: number;
  coordinates?: LatLng;
  label?: string;
  address?: string;
}

export interface CreateRouteTemplatePayload {
  name: string;
  from: RouteEndpointPayload;
  to: RouteEndpointPayload;
  validFrom?: string;
  validUntil?: string;
}

export interface PoiLocation {
  locationId: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
}
