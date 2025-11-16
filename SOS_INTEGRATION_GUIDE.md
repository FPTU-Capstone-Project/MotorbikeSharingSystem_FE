# SOS Feature - Integration Guide

## Quick Start

To integrate the SOS feature into your application, follow these steps:

### Step 1: Add Route Imports to App.tsx

Add these imports at the top of `/frontend/src/App.tsx`:

```typescript
// Add these to your existing lazy imports
const EmergencyContacts = lazy(() => import('./pages/EmergencyContacts'));
const MySOSAlerts = lazy(() => import('./pages/MySOSAlerts'));
const SafetyManagementNew = lazy(() => import('./pages/SafetyManagementNew'));
```

### Step 2: Add Routes to App.tsx

Add these routes to your Routes component in `/frontend/src/App.tsx` (after the existing routes):

```typescript
{/* SOS Feature Routes */}
<Route
  path="/emergency-contacts"
  element={
    <ProtectedRoute>
      <Layout>
        <EmergencyContacts />
      </Layout>
    </ProtectedRoute>
  }
/>
<Route
  path="/my-sos-alerts"
  element={
    <ProtectedRoute>
      <Layout>
        <MySOSAlerts />
      </Layout>
    </ProtectedRoute>
  }
/>

{/* Update the existing /safety route to use the new component */}
<Route
  path="/safety"
  element={
    <ProtectedRoute>
      <Layout>
        <SafetyManagementNew />
      </Layout>
    </ProtectedRoute>
  }
/>
```

### Step 3: Update Navigation Menu

Add navigation links to your sidebar/menu component (typically `Layout.tsx` or a `Sidebar.tsx`):

#### For Regular Users (Riders/Drivers):
```typescript
{
  name: 'Emergency Contacts',
  href: '/emergency-contacts',
  icon: PhoneIcon,
},
{
  name: 'My SOS Alerts',
  href: '/my-sos-alerts',
  icon: ExclamationTriangleIcon,
}
```

#### For Admin Users:
The existing "Safety Management" menu item will automatically use the new enhanced page.

### Step 4: (Optional) Add SOS Trigger Button to Ride Screen

If you want to add the SOS trigger button to an active ride screen:

```typescript
import SOSTriggerButton from '../components/SOSTriggerButton';

// In your ride component:
<div className="fixed bottom-4 right-4 z-50">
  <SOSTriggerButton
    rideId={currentRide?.id}
    onAlertTriggered={() => {
      // Optional: Show success message or navigate
      toast.success('SOS Alert triggered!');
    }}
  />
</div>
```

## API Configuration

Make sure your API base URL is configured correctly in `/frontend/src/config/api.config.ts` or `/frontend/src/utils/api.ts`.

The SOS service expects these endpoints:
- `GET/POST /api/v1/sos/alerts`
- `GET/PUT/DELETE /api/v1/sos/contacts`
- `POST /api/v1/sos/alerts/{id}/acknowledge`
- `POST /api/v1/sos/alerts/{id}/resolve`

## Environment Variables

Ensure these are set in your `.env` file:

```bash
REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
# or your production URL
```

## Testing the Feature

### Test as a User (Rider/Driver):

1. **Add Emergency Contacts**
   - Navigate to `/emergency-contacts`
   - Click "Thêm liên hệ"
   - Add at least one contact
   - Optionally set one as primary

2. **Trigger SOS Alert**
   - Navigate to `/my-sos-alerts`
   - Press and hold the red SOS button for 5 seconds
   - Confirm the alert in the modal
   - View the alert in your alert history

3. **Monitor Alert Status**
   - Check timeline events
   - Watch for status changes
   - Receive notifications (if WebSocket is configured)

### Test as an Admin:

1. **View Safety Dashboard**
   - Navigate to `/safety`
   - See statistics cards
   - View active alerts

2. **Manage Alerts**
   - Click "Chi tiết" on any alert
   - View complete alert information
   - Acknowledge the alert (add optional note)
   - Resolve or mark as false alarm

3. **Review Timeline**
   - View all events in chronological order
   - Check escalation count
   - Verify notification logs

## Common Issues & Solutions

### Issue: SOS button doesn't work
**Solution**: 
- Check if user has added emergency contacts
- Verify GPS/location permissions are granted
- Check browser console for errors

### Issue: Alerts not loading
**Solution**:
- Verify API base URL is correct
- Check JWT token is valid
- Check browser console for API errors
- Verify backend is running

### Issue: Location not captured
**Solution**:
- Grant location permissions in browser
- Use HTTPS (required for geolocation API)
- Check if device has GPS capability

### Issue: Can't trigger SOS
**Solution**:
- Hold button for full 5 seconds
- Don't release mouse/touch during hold
- Ensure you have at least one emergency contact

## File Checklist

Ensure these files exist:

### Components
- ✅ `/frontend/src/components/SOSTriggerButton.tsx`
- ✅ `/frontend/src/components/SOSAlertTimeline.tsx`
- ✅ `/frontend/src/components/SOSAlertDetailsModal.tsx`

### Pages
- ✅ `/frontend/src/pages/EmergencyContacts.tsx`
- ✅ `/frontend/src/pages/MySOSAlerts.tsx`
- ✅ `/frontend/src/pages/SafetyManagementNew.tsx`

### Services & Types
- ✅ `/frontend/src/services/sosService.ts`
- ✅ `/frontend/src/types/index.ts` (updated with SOS types)

### Documentation
- ✅ `/frontend/SOS_IMPLEMENTATION_SUMMARY.md`
- ✅ `/frontend/SOS_INTEGRATION_GUIDE.md` (this file)

## Next Steps After Integration

1. **Test all user flows**
   - User onboarding → add contacts
   - Trigger SOS → review alert
   - Admin acknowledge → resolve

2. **Setup monitoring**
   - Track SOS trigger rate
   - Monitor response times
   - Watch for false alarms

3. **Configure notifications**
   - Setup push notifications (optional)
   - Configure WebSocket (optional)
   - Email alerts for admins

4. **Training & Documentation**
   - Train admins on SOS workflow
   - Create user guide for SOS feature
   - Document escalation procedures

## Production Checklist

Before deploying to production:

- [ ] Backend SOS endpoints are deployed
- [ ] Database migrations applied (V15__sos_feature.sql)
- [ ] Environment variables configured
- [ ] HTTPS enabled (required for geolocation)
- [ ] Admin user IDs configured in backend
- [ ] Fallback emergency number configured (e.g., 113)
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] User acceptance testing done

## Support & Troubleshooting

For issues or questions:
1. Check the implementation summary: `SOS_IMPLEMENTATION_SUMMARY.md`
2. Review backend documentation: `backend/docs/other/SOSImplementation.md`
3. Check demo script: `backend/docs/other/SOSDemoScript.md`

## Version Information

- **Frontend Implementation Version**: 1.0.0
- **Backend API Version**: Based on V15 migrations
- **Compatibility**: Requires backend with SOS feature (branch: sos-flow or higher)

---

**Last Updated**: November 16, 2025
**Status**: ✅ Ready for Integration
