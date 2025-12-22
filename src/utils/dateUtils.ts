/**
 * Date Utilities - Centralized timezone handling for Vietnam (Asia/Ho_Chi_Minh)
 * 
 * IMPORTANT: Backend sends timestamps with 'Z' suffix but they are actually Vietnam time.
 * These utilities handle the conversion properly.
 */

// Vietnam timezone
export const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';
export const DEFAULT_LOCALE = 'vi-VN';

/**
 * Parse a timestamp from the backend.
 * Backend sends Vietnam time with 'Z' suffix (incorrectly marked as UTC).
 * This function treats the timestamp as Vietnam local time.
 */
export const parseBackendTimestamp = (timestamp: string | undefined | null): Date | null => {
  if (!timestamp) return null;
  
  // Remove 'Z' suffix if present since backend sends Vietnam time marked as UTC
  const cleanTimestamp = timestamp.replace('Z', '');
  const date = new Date(cleanTimestamp);
  
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Format date for display with Vietnam timezone
 */
export const formatDateTime = (
  timestamp: string | undefined | null,
  options?: Intl.DateTimeFormatOptions,
  fallback = '—'
): string => {
  const date = parseBackendTimestamp(timestamp);
  if (!date) return fallback;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    ...options,
  };
  
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, defaultOptions).format(date);
};

/**
 * Format date only (no time)
 */
export const formatDate = (
  timestamp: string | undefined | null,
  options?: Intl.DateTimeFormatOptions,
  fallback = '—'
): string => {
  const date = parseBackendTimestamp(timestamp);
  if (!date) return fallback;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  };
  
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, defaultOptions).format(date);
};

/**
 * Format time only (no date)
 */
export const formatTime = (
  timestamp: string | undefined | null,
  options?: Intl.DateTimeFormatOptions,
  fallback = '—'
): string => {
  const date = parseBackendTimestamp(timestamp);
  if (!date) return fallback;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    ...options,
  };
  
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, defaultOptions).format(date);
};

/**
 * Format date with short month name
 */
export const formatDateShort = (
  timestamp: string | undefined | null,
  fallback = '—'
): string => {
  const date = parseBackendTimestamp(timestamp);
  if (!date) return fallback;
  
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/**
 * Format date and time with short month
 */
export const formatDateTimeShort = (
  timestamp: string | undefined | null,
  fallback = '—'
): string => {
  const date = parseBackendTimestamp(timestamp);
  if (!date) return fallback;
  
  const dayPart = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
  
  const timePart = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
  
  return `${dayPart}, ${timePart}`;
};

/**
 * Format relative time (e.g., "5 phút trước", "Hôm qua")
 */
export const formatRelativeTime = (
  timestamp: string | undefined | null,
  fallback = '—'
): string => {
  const date = parseBackendTimestamp(timestamp);
  if (!date) return fallback;
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.round(Math.abs(diff) / 60000);
  
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  
  const days = Math.round(hours / 24);
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  
  return formatDate(timestamp);
};

/**
 * Format date label for grouping (e.g., "Hôm nay", "Hôm qua", "Thứ hai, 22/12")
 */
export const formatDateLabel = (
  timestamp: string | undefined | null,
  fallback = '—'
): string => {
  const date = parseBackendTimestamp(timestamp);
  if (!date) return fallback;
  
  const today = new Date();
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.floor((todayOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  }).format(date);
};

/**
 * Check if a date is expired
 */
export const isExpired = (timestamp: string | undefined | null): boolean => {
  const date = parseBackendTimestamp(timestamp);
  if (!date) return false;
  return date < new Date();
};

/**
 * Format date for form input (YYYY-MM-DD)
 */
export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Get date range for presets
 */
export const getPresetDateRange = (preset: 'today' | 'week' | 'month'): { from: string; to: string } => {
  const now = new Date();
  const end = formatDateForInput(now);
  
  if (preset === 'today') {
    return { from: end, to: end };
  }
  
  if (preset === 'week') {
    const start = new Date(now);
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1; // Monday as start
    start.setDate(start.getDate() - diff);
    return { from: formatDateForInput(start), to: end };
  }
  
  if (preset === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: formatDateForInput(start), to: end };
  }
  
  return { from: '', to: '' };
};

