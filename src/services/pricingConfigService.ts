import { apiFetch, PageResponse } from '../utils/api';
import {
  CreatePricingConfigPayload,
  PricingConfigDto,
  PricingConfigStatus,
  UpdatePricingConfigPayload,
  FareTierDto,
} from '../types/pricing.types';

export interface PricingConfigSearchParams {
  page?: number;
  size?: number;
  status?: PricingConfigStatus | 'all';
}

const pricingConfigService = {
  async list(params: PricingConfigSearchParams = {}): Promise<PageResponse<PricingConfigDto>> {
    const query = new URLSearchParams();
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 10));
    if (params.status && params.status !== 'all') {
      query.set('status', params.status);
    }
    return apiFetch<PageResponse<PricingConfigDto>>(`/admin/pricing-configs?${query.toString()}`);
  },

  async get(id: number): Promise<PricingConfigDto> {
    return apiFetch<PricingConfigDto>(`/admin/pricing-configs/${id}`);
  },

  async create(payload: CreatePricingConfigPayload): Promise<PricingConfigDto> {
    return apiFetch<PricingConfigDto>('/admin/pricing-configs', {
      method: 'POST',
      body: payload,
    });
  },

  async updateMetadata(id: number, payload: UpdatePricingConfigPayload): Promise<PricingConfigDto> {
    return apiFetch<PricingConfigDto>(`/admin/pricing-configs/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },

  async replaceTiers(id: number, tiers: FareTierDto[]): Promise<PricingConfigDto> {
    return apiFetch<PricingConfigDto>(`/admin/pricing-configs/${id}/tiers`, {
      method: 'PUT',
      body: { fareTiers: tiers },
    });
  },

  async addTier(id: number, tier: FareTierDto): Promise<PricingConfigDto> {
    return apiFetch<PricingConfigDto>(`/admin/pricing-configs/${id}/tiers`, {
      method: 'POST',
      body: tier,
    });
  },

  async updateTier(id: number, tierId: number, tier: FareTierDto): Promise<PricingConfigDto> {
    return apiFetch<PricingConfigDto>(`/admin/pricing-configs/${id}/tiers/${tierId}`, {
      method: 'PUT',
      body: tier,
    });
  },

  async deleteTier(id: number, tierId: number): Promise<PricingConfigDto> {
    return apiFetch<PricingConfigDto>(`/admin/pricing-configs/${id}/tiers/${tierId}`, {
      method: 'DELETE',
    });
  },

  async schedule(id: number): Promise<PricingConfigDto> {
    return apiFetch<PricingConfigDto>(`/admin/pricing-configs/${id}/schedule`, {
      method: 'POST',
    });
  },

  async archive(id: number): Promise<PricingConfigDto> {
    return apiFetch<PricingConfigDto>(`/admin/pricing-configs/${id}/archive`, {
      method: 'POST',
    });
  },
};

export default pricingConfigService;
