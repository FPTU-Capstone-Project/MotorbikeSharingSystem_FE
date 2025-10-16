import { apiFetch, PageResponse } from "../utils/api";
import { UserManagementItem } from "../types";

export async function getAllUsers(
  page = 0,
  size = 10,
  sortBy = 'userId',
  sortDir = 'desc'
): Promise<PageResponse<UserManagementItem>> {
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('size', String(size));
  query.set('sortBy', sortBy);
  query.set('sortDir', sortDir);

  return apiFetch<PageResponse<UserManagementItem>>(`/me/all?${query.toString()}`);
}