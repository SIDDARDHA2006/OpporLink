# 🐛 Events Page - Debug Checklist

## ✅ Backend Status

### Endpoints
- ✅ `GET /test` - Backend connectivity test
- ✅ `GET /events` - Returns all 5 events
- ✅ `GET /api/events` - Returns all 5 events (with filters)
- ✅ CORS configured for `http://127.0.0.1:3002` and `http://localhost:3002`

### Test Command
```bash
curl http://localhost:3001/test
# Response: {"message":"Backend working"}

curl http://localhost:3001/events
# Response: [5 events in JSON]
```

---

## ✅ Frontend Setup

### DOM Elements Required
```html
<div id="loadingSpinner"></div>  <!-- Shows during fetch -->
<div id="eventsContainer"></div> <!-- Event cards render here -->
<span id="eventCount">0</span>    <!-- Event count display -->
<input id="searchInput" type="text"> <!-- Search box -->
<select id="categoryFilter"></select>
<select id="modeFilter"></select>
<select id="domainFilter"></select>
<select id="levelFilter"></select>
```

### JavaScript Console Expected Logs

When page loads, open DevTools (F12) and check Console tab:

```
Events page loaded
API_BASE_URL: http://localhost:3001
Spinner shown
Fetching events from: http://localhost:3001/events
Response status: 200
Response headers: Headers {...}
Events received: Array(5)
Number of events: 5
renderEvents called with 5 events
Rendering event 1: Future Hack 2026
Rendering event 2: Web Dev Bootcamp
Rendering event 3: Design Sprint 2026
Rendering event 4: Startup Weekend
Rendering event 5: Cloud Computing Workshop
Rendering complete. Total cards rendered: 5
Spinner hidden
```

---

## 🔍 How to Debug

### If Events Don't Load

1. **Check Console**: Press F12, go to Console tab
2. **Look for errors**: Red text indicates problems
3. **Check network**: F12 → Network tab → look for `/events` request
4. **Verify response**: Click the `/events` request → Response tab

### Common Issues

| Issue | Solution |
|-------|----------|
| CORS error | Backend CORS not configured properly |
| 404 error | /events endpoint not found (check server.js) |
| Spinner stays | Check if fetch completes, look for console errors |
| No events show | Check if renderEvents() is called with data |
| "No events available." | Events array is empty (check API response) |

### Manual Testing

```bash
# Test backend connectivity
curl http://localhost:3001/test

# Test events endpoint directly
curl http://localhost:3001/events | jq '.[0].title'

# Count events
curl http://localhost:3001/events | jq 'length'
```

---

## 📋 Checklist Before Deploying

- [ ] Backend server running on port 3001
- [ ] `/test` endpoint returns `{"message":"Backend working"}`
- [ ] `/events` endpoint returns 5 events
- [ ] CORS headers present in response
- [ ] events.html loads with no console errors
- [ ] Spinner appears and disappears
- [ ] All 5 events render on page
- [ ] Event count shows "5"
- [ ] Filters respond to changes
- [ ] Search filters events by title

---

## 🚀 Quick Start

1. **Start Backend**:
   ```bash
   cd "/Users/siddardha/Desktop/Fortex Cursor"
   node server.js
   ```

2. **Open Frontend**:
   ```
   http://127.0.0.1:3002/events.html
   ```

3. **Check Console**:
   ```
   F12 → Console tab → Look for logs
   ```

---

## 📊 Expected Result

✅ Page loads  
✅ 5 events appear  
✅ Spinner disappears  
✅ No red errors in console  
✅ Filters work  
✅ Search works  

