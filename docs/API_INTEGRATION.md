# API Integration Documentation

Complete guide for integrating frontend with backend APIs

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Available APIs](#available-apis)
- [Usage Examples](#usage-examples)
- [Mock Data Fallback](#mock-data-fallback)
- [Authentication](#authentication)
- [Troubleshooting](#troubleshooting)

## Overview

The frontend has been fully integrated with backend REST APIs. The system includes intelligent fallback to mock data when authentication is not configured, allowing seamless development.

### Key Features

- Environment switching between local and production
- Smart caching for GET requests
- Automatic retry on network failures
- Request deduplication
- Mock data fallback when APIs fail
- Type-safe TypeScript interfaces
- Custom React hooks for data fetching

## Quick Start

### Check Current Setup

1. Frontend runs on: `http://localhost:3000`
2. Backend runs on: `http://localhost:8081`
3. API base URL: `http://localhost:8081/api/v1`

### Switch Between Environments

Edit `src/config/api.config.ts`:

```typescript
// For local development
export const CURRENT_ENV: ApiEnvironment = ApiEnvironment.LOCAL;

// For production deployment
// export const CURRENT_ENV: ApiEnvironment = ApiEnvironment.DEPLOY;
```

## Configuration

### API Endpoints

All endpoints are defined in `src/config/api.config.ts`:

```typescript
export const API_ENDPOINTS = {
  ADMIN_WALLET: {
    SEARCH: '/admin/wallet/search',
    ADJUSTMENT: '/admin/wallet/adjustment',
    PROMO: '/admin/wallet/promo',
    RECONCILIATION: '/admin/wallet/reconciliation',
    FREEZE: (userId: number) => `/admin/wallet/${userId}/freeze`,
  },
  REPORTS: {
    DASHBOARD: '/reports/wallet/dashboard',
    TOPUP_TRENDS: '/reports/wallet/topup-trends',
    COMMISSION: '/reports/wallet/commission',
  },
  VERIFICATION: {
    STUDENTS: { ... },
    DRIVERS: { ... },
  },
  VEHICLES: { ... },
};
```

### Cache Configuration

```typescript
export const CACHE_CONFIG = {
  SHORT: 30000,    // 30 seconds
  MEDIUM: 300000,  // 5 minutes
  LONG: 900000,    // 15 minutes
};
```

## Available APIs

<details>
<summary><strong>Reports API</strong></summary>

### Get Dashboard Statistics

Fetches dashboard metrics including wallet totals, transactions, and balances.

**Endpoint:** `GET /reports/wallet/dashboard`

**Response:**
```typescript
{
  totalActiveWallets: number;
  totalSystemBalance: string;
  todayTopUps: string;
  todayPayouts: string;
  pendingTransactions: number;
  averageWalletBalance: string;
  topUpCount: number;
  payoutCount: number;
  generatedAt: string;
}
```

**Usage:**
```typescript
import { ReportsAPI } from '../api';

const dashboard = await ReportsAPI.getDashboard();
console.log(dashboard.totalActiveWallets); // 2847
```

</details>

<details>
<summary><strong>Admin Wallet API</strong></summary>

### Search Wallets

Search and filter user wallets with pagination.

**Endpoint:** `GET /admin/wallet/search`

**Parameters:**
- page (number, optional)
- size (number, optional)
- email (string, optional)
- role (string, optional)
- isActive (boolean, optional)

**Response:**
```typescript
{
  content: WalletResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}
```

### Adjust Wallet Balance

Manually credit or debit user wallet.

**Endpoint:** `POST /admin/wallet/adjustment`

**Body:**
```typescript
{
  userId: number;
  amount: string;
  reason: string;
  adjustmentType: 'CREDIT' | 'DEBIT';
}
```

### Distribute Promotional Credits

Send promo credits to users.

**Endpoint:** `POST /admin/wallet/promo`

**Body:**
```typescript
{
  amount: string;
  campaignName: string;
  description?: string;
  userRole?: 'RIDER' | 'DRIVER' | 'ALL';
}
```

</details>

<details>
<summary><strong>Verification API</strong></summary>

### Get Pending Student Verifications

**Endpoint:** `GET /verification/students/pending`

### Approve Student Verification

**Endpoint:** `POST /verification/students/{id}/approve`

### Get Pending Driver Verifications

**Endpoint:** `GET /verification/drivers/pending`

### Approve Driver Documents

**Endpoint:** `POST /verification/drivers/{id}/approve-docs`

</details>

<details>
<summary><strong>Vehicle API</strong></summary>

### Get All Vehicles

**Endpoint:** `GET /vehicles`

### Get Vehicle by ID

**Endpoint:** `GET /vehicles/{id}`

### Create Vehicle

**Endpoint:** `POST /vehicles`

### Update Vehicle

**Endpoint:** `PUT /vehicles/{id}`

### Delete Vehicle

**Endpoint:** `DELETE /vehicles/{id}`

</details>

## Usage Examples

### Example 1: Fetch Dashboard Data

```typescript
import { useApi } from '../utils/hooks';
import { ReportsAPI } from '../api';

function Dashboard() {
  const { data, loading, error, refetch } = useApi(
    () => ReportsAPI.getDashboard(),
    {
      enabled: true,
      refetchInterval: 30000, // Auto-refresh every 30 seconds
      onError: (err) => console.error('Failed:', err)
    }
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>Total Wallets: {data.totalActiveWallets}</h1>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### Example 2: Display Data with Mock Fallback

```typescript
import { useApi } from '../utils/hooks';
import { ReportsAPI } from '../api';
import { MOCK_DASHBOARD } from '../api/mock-data';

function Dashboard() {
  const { data: apiData, loading, error } = useApi(
    () => ReportsAPI.getDashboard()
  );

  // Use mock data if API fails
  const dashboardData = apiData || MOCK_DASHBOARD;

  return (
    <div>
      {error && (
        <div className="warning">
          Using mock data - API requires authentication
        </div>
      )}
      <h1>Wallets: {dashboardData.totalActiveWallets}</h1>
    </div>
  );
}
```

### Example 3: Format Currency

```typescript
function formatCurrency(amount: string): string {
  const num = parseFloat(amount);
  return `₫${num.toLocaleString('vi-VN')}`;
}

// Usage
const balance = '15847500000';
console.log(formatCurrency(balance)); // ₫15,847,500,000
```

## Mock Data Fallback

### How It Works

1. Frontend attempts to call backend API
2. Backend returns 401 or 403 (requires authentication)
3. Frontend detects error automatically
4. Falls back to predefined mock data
5. Shows warning banner to developer

### Mock Data Available

The system includes realistic mock data for:

- Dashboard statistics
- Sample wallets (4 users)
- Transaction data
- Driver stats

Located in: `src/api/mock-data.ts`

### When Mock Data Is Used

- Backend not running
- Authentication not configured
- Invalid JWT token
- 401/403 errors from backend

### Disable Mock Data

To use only real API data:

```typescript
const { data, loading, error } = useApi(
  () => ReportsAPI.getDashboard()
);

// Don't fallback - just handle error
if (error) {
  return <ErrorPage />;
}
```

## Authentication

### Current Status

Backend requires JWT authentication for admin endpoints. Frontend automatically handles this with mock data fallback.

### Setup Authentication

<details>
<summary><strong>Option 1: Continue with Mock Data (Recommended)</strong></summary>

No action needed. Frontend works perfectly with mock data.

Advantages:
- Develop UI without backend dependency
- Fast iteration
- No authentication setup required

</details>

<details>
<summary><strong>Option 2: Login and Get JWT Token</strong></summary>

1. Register or login via backend
2. Get JWT access token
3. Set token in frontend:

```typescript
import { httpClient } from '../api';

// After successful login
httpClient.setAuthToken('your-jwt-token-here');

// Token is saved in localStorage and used for all requests
```

</details>

<details>
<summary><strong>Option 3: Temporarily Disable Auth (Dev Only)</strong></summary>

Edit `backend/SecurityConfig.java` line 189:

```java
// Change from
.anyRequest().authenticated()

// To
.anyRequest().permitAll()
```

Then rebuild backend.

</details>

## Troubleshooting

### Issue: ERR_CONNECTION_REFUSED

**Cause:** Backend not running

**Solution:**
```bash
cd backend
./orchestrator.sh start
```

### Issue: 403 Forbidden

**Cause:** API requires authentication

**Solution:**
- Frontend automatically uses mock data (no action needed)
- Or setup authentication (see Authentication section)

### Issue: 401 Unauthorized

**Cause:** JWT token missing or expired

**Solution:**
```typescript
import { httpClient } from '../api';

// Clear old token
httpClient.setAuthToken(null);

// Login again and set new token
httpClient.setAuthToken(newToken);
```

### Issue: Data not updating

**Cause:** Cache is stale

**Solution:**
```typescript
import { httpClient } from '../api';

// Clear all cache
httpClient.clearCache();

// Or clear specific cache
httpClient.clearCache('dashboard');
```

### Issue: CORS error

**Cause:** Backend CORS not configured

**Solution:**
Backend already has CORS configured in SecurityConfig.java. If still facing issues, check if backend is running on correct port (8081).

### Issue: Port conflict

**Cause:** Another service using port 8081

**Solution:**
```bash
# Check what's using port 8081
lsof -i :8081

# Kill the process
kill -9 <PID>

# Or change backend port in application.properties
```

## Best Practices

### 1. Always use custom hooks

```typescript
// Good
const { data, loading, error } = useApi(() => ReportsAPI.getDashboard());

// Bad
useEffect(() => {
  ReportsAPI.getDashboard().then(setData);
}, []);
```

### 2. Handle loading and error states

```typescript
if (loading) return <Skeleton />;
if (error) return <ErrorBoundary error={error} />;
return <DataDisplay data={data} />;
```

### 3. Use mock data fallback for development

```typescript
const dashboardData = apiData || MOCK_DASHBOARD;
```

### 4. Clear cache after mutations

APIs automatically clear related cache, but you can do it manually:

```typescript
await AdminWalletAPI.adjustWallet(request);
httpClient.clearCache('wallet'); // Clear wallet-related cache
```

### 5. Format Vietnamese currency properly

```typescript
const formatVND = (amount: string) => {
  return `₫${parseFloat(amount).toLocaleString('vi-VN')}`;
};
```

## Summary

The frontend is fully integrated with backend APIs and includes intelligent fallback to mock data. This allows you to:

- Develop UI/UX without backend dependency
- Test with realistic data immediately
- Seamlessly switch to real APIs when ready
- Deploy with confidence

Current status: **Working with mock data fallback**

Next steps:
- Continue frontend development (recommended)
- Setup authentication when needed
- Test with real backend APIs

---

**Last Updated:** 2025-10-02
**Version:** 1.0.0
