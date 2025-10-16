import { apiFetch, PageResponse } from '../utils/api';

// =====================
// VEHICLE ENDPOINTS
// =====================

export interface Vehicle {
  id: number;
  driverId: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vehicleType: string;
  registrationDocument?: string;
  insuranceDocument?: string;
  photos: string[];
  isVerified: boolean;
  verificationStatus: string;
  createdAt: string;
}

export interface CreateVehicleRequest {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vehicleType: string;
}

export const vehicleService = {
  // Admin: Get all vehicles with pagination and sorting
  getAllVehicles: (page = 0, size = 10, sortBy: string = 'createdAt', sortDir: 'asc' | 'desc' = 'desc') =>
    apiFetch<PageResponse<any>>(`/vehicles?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),

  // Admin: Get vehicles by status with pagination
  getVehiclesByStatus: (status: string, page = 0, size = 10, sortBy: string = 'createdAt', sortDir: 'asc' | 'desc' = 'desc') =>
    apiFetch<PageResponse<any>>(`/vehicles/status/${encodeURIComponent(status)}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  getMyVehicles: () =>
    apiFetch<Vehicle[]>('/vehicles/my-vehicles'),

  getVehicleById: (id: number) =>
    apiFetch<Vehicle>(`/vehicles/${id}`),

  createVehicle: (data: CreateVehicleRequest) =>
    apiFetch<Vehicle>('/vehicles', { method: 'POST', body: data }),

  updateVehicle: (id: number, data: Partial<CreateVehicleRequest>) =>
    apiFetch<Vehicle>(`/vehicles/${id}`, { method: 'PUT', body: data }),

  deleteVehicle: (id: number) =>
    apiFetch(`/vehicles/${id}`, { method: 'DELETE' }),

  uploadVehiclePhoto: (vehicleId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch<{ url: string }>(`/vehicles/${vehicleId}/photos`, {
      method: 'POST',
      body: formData
    });
  },
};