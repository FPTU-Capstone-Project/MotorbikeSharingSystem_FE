# API Integration - Quick Reference

Restored after orchestrator.sh overwrote changes

## Files Restored

### Frontend Files

```
frontend/src/
├── config/
│   └── api.config.ts          ✓ Port 8081, environment switching
├── types/
│   └── api.types.ts           ✓ TypeScript interfaces
├── api/
│   ├── http-client.ts         ✓ HTTP client with caching
│   ├── reports.api.ts         ✓ Reports API
│   ├── mock-data.ts           ✓ Mock data fallback
│   └── index.ts               ✓ Central exports
├── utils/
│   └── hooks.ts               ✓ Custom React hooks
├── pages/
│   └── Dashboard.tsx          ✓ Updated with API integration
└── docs/
    └── API_INTEGRATION.md     ✓ Complete documentation
```

### Backend Files

```
backend/src/main/java/com/mssus/app/security/
└── SecurityConfig.java        ✓ Added REPORTS_PATHS and ADMIN_PATHS
```

## What Works Now

✓ Dashboard loads with mock data automatically
✓ Warning banner shows when using mock data
✓ API calls to http://localhost:8081
✓ Smart caching and retry logic
✓ TypeScript type safety
✓ Backend security properly configured

## Quick Test

```bash
# Frontend should display dashboard with warning banner
open http://localhost:3000

# Backend should return 401/403 (expected)
curl http://localhost:8081/api/v1/reports/wallet/dashboard
```

## Environment Switching

Edit `src/config/api.config.ts` line 11:

```typescript
// Local development
export const CURRENT_ENV: ApiEnvironment = ApiEnvironment.LOCAL;

// Production
// export const CURRENT_ENV: ApiEnvironment = ApiEnvironment.DEPLOY;
```

## Mock Data vs Real Data

Frontend automatically uses mock data when API fails:

**Mock Data:**
- 2,847 active wallets
- ₫15.8 billion total balance
- 147 top-ups today
- 12 pending transactions

**To Use Real Data:**
1. Setup JWT authentication
2. See `docs/API_INTEGRATION.md` for details

## Key Files to Know

| File | Purpose |
|------|---------|
| `api.config.ts` | API base URL, endpoints, cache config |
| `http-client.ts` | Handles requests, caching, retries |
| `reports.api.ts` | Dashboard API calls |
| `mock-data.ts` | Fallback data |
| `hooks.ts` | useApi custom hook |
| `Dashboard.tsx` | Example usage |

## Usage Example

```typescript
import { useApi } from '../utils/hooks';
import { ReportsAPI } from '../api';
import { MOCK_DASHBOARD } from '../api/mock-data';

function Dashboard() {
  const { data: apiData, loading, error } = useApi(
    () => ReportsAPI.getDashboard(),
    { refetchInterval: 30000 }
  );

  // Auto-fallback to mock data
  const data = apiData || MOCK_DASHBOARD;

  return (
    <>
      {error && <Warning />}
      <Stats data={data} />
    </>
  );
}
```

## Troubleshooting

**Issue:** ERR_CONNECTION_REFUSED
**Fix:** Backend not running. Start with `./orchestrator.sh`

**Issue:** 403 Forbidden
**Fix:** Expected. Frontend uses mock data automatically.

**Issue:** Cache issues
**Fix:** `httpClient.clearCache()`

## Full Documentation

See `docs/API_INTEGRATION.md` for:
- Complete API list
- Authentication setup
- Advanced usage
- Best practices

## Important Notes

- Backend port: **8081** (not 8080)
- CORS: Already configured
- Authentication: Optional (mock data works)
- Cache: 30s-15min depending on endpoint

---

**Status:** ✓ All files restored and working
**Next:** Continue frontend development or setup auth
