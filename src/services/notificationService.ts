import { apiFetch, PageResponse } from "../utils/api";
import { NotificationDetail, NotificationSummary } from "../types";
import { API_ENDPOINTS } from "../config/api.config";

export const notificationService = {
  list: (page = 0, size = 20): Promise<PageResponse<NotificationSummary>> => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(size));
    params.set("sortBy", "createdAt");
    params.set("sortDir", "desc");
    return apiFetch<PageResponse<NotificationSummary>>(
      `${API_ENDPOINTS.NOTIFICATIONS.LIST}?${params.toString()}`
    );
  },

  get: (id: number): Promise<NotificationDetail> =>
    apiFetch<NotificationDetail>(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id)),

  markRead: (id: number): Promise<void> =>
    apiFetch<void>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {
      method: "PUT",
    }),

  markAllRead: (): Promise<void> =>
    apiFetch<void>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {
      method: "PUT",
    }),

  delete: (id: number): Promise<void> =>
    apiFetch<void>(API_ENDPOINTS.NOTIFICATIONS.DELETE(id), {
      method: "DELETE",
    }),

  deleteAll: (): Promise<void> =>
    apiFetch<void>(API_ENDPOINTS.NOTIFICATIONS.DELETE_ALL, {
      method: "DELETE",
    }),
};
