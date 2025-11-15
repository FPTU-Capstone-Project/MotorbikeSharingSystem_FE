import { apiFetch, PageResponse } from '../utils/api';
import {
  RouteTemplate,
  PricingContext,
  CreateRouteTemplatePayload,
  PoiLocation,
} from '../types/routes.types';
import { API_ENDPOINTS } from '../config/api.config';

export interface RouteSearchParams {
  page?: number;
  size?: number;
  routeType?: string;
}

const routeAdminService = {
  async listRoutes(params: RouteSearchParams = {}): Promise<PageResponse<RouteTemplate>> {
    const query = new URLSearchParams();
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 10));
    query.set('routeType', params.routeType ?? 'TEMPLATE');
    return apiFetch<PageResponse<RouteTemplate>>(`/admin/routes?${query.toString()}`);
  },

  async createRoute(payload: CreateRouteTemplatePayload): Promise<RouteTemplate> {
    return apiFetch<RouteTemplate>('/admin/routes', {
      method: 'POST',
      body: payload,
    });
  },

  async previewRoute(payload: CreateRouteTemplatePayload): Promise<RouteTemplate> {
    return apiFetch<RouteTemplate>('/admin/routes/preview', {
      method: 'POST',
      body: payload,
    });
  },

  async getPricingContext(): Promise<PricingContext> {
    return apiFetch<PricingContext>('/admin/routes/pricing-context');
  },

  async getRouteDetail(routeId: number): Promise<RouteTemplate> {
    return apiFetch<RouteTemplate>(`/admin/routes/${routeId}`);
  },

  async getPoiLocations(): Promise<PoiLocation[]> {
    return apiFetch<PoiLocation[]>(API_ENDPOINTS.LOCATIONS.POIS);
  },
};

export default routeAdminService;
