export type PricingConfigStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'ARCHIVED';

export interface FareTierDto {
  fareTierId?: number;
  tierLevel: number;
  minKm: number;
  maxKm: number;
  amount: number;
  description?: string;
  isActive?: boolean;
}

export interface PricingConfigDto {
  pricingConfigId: number;
  version: string;
  systemCommissionRate: number;
  validFrom?: string;
  validUntil?: string;
  status: PricingConfigStatus;
  changeReason?: string;
  noticeSentAt?: string;
  fareTiers: FareTierDto[];
}

export interface CreatePricingConfigPayload {
  systemCommissionRate: number;
  changeReason?: string;
  fareTiers: FareTierDto[];
}

export interface UpdatePricingConfigPayload {
  systemCommissionRate?: number;
  changeReason?: string;
}
