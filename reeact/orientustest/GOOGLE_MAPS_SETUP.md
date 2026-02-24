# 🗺️ Google Maps Setup Instructions

Your contact page now uses **real Google Maps** with actual geographic coordinates!

## 📍 What's Implemented

- **Real interactive Google Maps** showing North Africa region
- **3 Office locations** with accurate GPS coordinates:
  - 🇲🇦 **Morocco** (Casablanca): 33.5731°N, 7.5898°W
  - 🇹🇳 **Tunisia** (Tunis): 36.8065°N, 10.1815°E
  - 🇪🇬 **Egypt** (Cairo): 30.0444°N, 31.2357°E
- **Custom markers** that bounce when selected
- **Info windows** showing contact details on marker click
- **Styled map** with custom colors matching your brand

## 🔑 Get Your Free Google Maps API Key

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/google/maps-apis

### Step 2: Create or Select Project
- Click "Select a Project" at the top
- Click "NEW PROJECT"
- Name it "Orientus Website" (or any name you like)
- Click "CREATE"

### Step 3: Enable Maps JavaScript API
- In the search bar, type "Maps JavaScript API"
- Click on "Maps JavaScript API"
- Click "ENABLE"

### Step 4: Create API Key
- Go to "Credentials" from the left menu
- Click "CREATE CREDENTIALS" → "API key"
- Copy your new API key (starts with `AIza...`)

### Step 5: Secure Your API Key (IMPORTANT!)
- Click "Restrict Key"
- Under "Application restrictions", select "HTTP referrers"
- Add these referrers:
  - `http://localhost:*/*`
  - `http://127.0.0.1:*/*`
  - `https://yourdomain.com/*` (replace with your actual domain)
- Under "API restrictions", select "Restrict key"
- Choose only "Maps JavaScript API"
- Click "SAVE"

### Step 6: Add API Key to Your Project
Open the `.env` file in your project root and replace:
```env
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```
with:
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSy... (your actual key)
```

### Step 7: Restart Development Server
```bash
# Stop the current server (Ctrl+C)
npm start
# Or
npm run dev
```

## 💰 Pricing

Google Maps is **FREE** for:
- Up to **28,000 map loads per month**
- That's about **900 visitors per day**
- Perfect for most small-to-medium websites!

You won't be charged unless you exceed the free tier AND explicitly enable billing.

## ✅ What You'll See

Once configured, your contact page will show:
- ✅ Full interactive world map centered on North Africa
- ✅ Blue markers for each office location
- ✅ Red bouncing marker for the selected country
- ✅ Click markers to see contact details in popup
- ✅ Zoom and pan the map freely
- ✅ Full Google Maps features (satellite view, terrain, etc.)

## 🚀 Adding More Countries

To add more office locations, edit `src/data/countryContacts.ts`:

```typescript
{
  id: 'saudi',
  name: 'Saudi Arabia',
  city: 'Riyadh',
  address: 'King Fahd Road, Riyadh, Saudi Arabia',
  phone: '+966 11 234 5678',
  email: 'saudi@orientus.com',
  workingHours: 'Sun-Thu: 9:00 AM - 5:00 PM (GMT+3)',
  coordinates: { 
    lat: 24.7136,  // Riyadh latitude
    lng: 46.6753,  // Riyadh longitude
  },
}
```

Find coordinates for any city: https://www.latlong.net/

## 🆘 Troubleshooting

### Map shows "API Key Required" error
- Make sure you added the key to `.env` file
- Restart your development server
- Check that the key starts with `AIza` (not spaces or quotes)

### Map loads but shows "For development purposes only" watermark
- You need to enable billing in Google Cloud (even though it's free)
- Or add restrictions to your API key (see Step 5)

### Map shows gray area
- Enable "Maps JavaScript API" (not just "Maps API")
- Wait 2-3 minutes for Google to activate the API

## 📁 Files Modified

- ✅ `src/components/GoogleMapComponent.tsx` - New Google Maps component
- ✅ `src/components/Contact.tsx` - Updated to use Google Maps
- ✅ `src/data/countryContacts.ts` - Added GPS coordinates
- ✅ `.env` - API key configuration file

---

Need help? The map will show friendly error messages if something is wrong!
