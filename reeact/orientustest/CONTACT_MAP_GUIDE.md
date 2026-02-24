# Interactive Contact Map - Usage Guide

## 📋 Overview
The Contact page features an interactive world map where users can click on countries to view office contact information.

## 📁 File Structure
```
src/
├── data/
│   └── countryContacts.ts          # Country contact data
├── components/
│   ├── Contact.tsx                 # Main contact page with map
│   └── ContactCard.tsx            # Contact information display card
```

## ✨ Features
- ✅ Interactive SVG world map
- ✅ Clickable countries with smooth animations
- ✅ Contact information cards with phone, email, address, hours
- ✅ Hover effects and visual feedback
- ✅ Quick access buttons for all countries
- ✅ Default global contact before selection
- ✅ Fully responsive design

## 🎯 How to Add New Countries

### Step 1: Add Country Data
Open `src/data/countryContacts.ts` and add a new country object:

```typescript
{
  id: 'france',                    // Unique lowercase identifier
  name: 'France',                  // Display name
  address: '123 Rue de Paris, 75001 Paris, France',
  phone: '+33 1 23 45 67 89',
  email: 'france@orientus.com',
  workingHours: 'Mon-Fri: 9:00 AM - 6:00 PM (GMT+1)',
  coordinates: { x: 490, y: 240 }, // Position on map (x: 0-1000, y: 0-600)
}
```

**✅ Map Coordinate Guide:**
- x-axis: 0 (far left) to 1000 (far right)
- y-axis: 0 (top) to 600 (bottom)
- Center of map: x: 500, y: 300

**Example coordinates by region:**
- North Africa: x: 450-550, y: 270-310
- Middle East: x: 550-650, y: 280-350
- Europe: x: 480-580, y: 220-280
- North America: x: 200-350, y: 240-340

### Step 2: Add Country to Map SVG
Open `src/components/Contact.tsx` and find the SVG map section (around line 70).

Add a new `<motion.path>` element:

```typescript
{/* France */}
<motion.path
  id="france"
  d="M 480 230 L 500 225 L 510 240 L 505 255 L 490 260 L 475 250 Z"
  fill={selectedCountry.id === 'france' ? '#3B82F6' : hoveredCountry === 'france' ? '#60A5FA' : '#D1D5DB'}
  stroke="#374151"
  strokeWidth="1.5"
  className="cursor-pointer transition-all duration-300"
  onClick={() => handleCountryClick('france')}
  onMouseEnter={() => setHoveredCountry('france')}
  onMouseLeave={() => setHoveredCountry(null)}
  whileHover={{ scale: 1.05, originX: 0.5, originY: 0.5 }}
  animate={{
    fill: selectedCountry.id === 'france' ? '#3B82F6' : hoveredCountry === 'france' ? '#60A5FA' : '#D1D5DB'
  }}
/>
```

**⚠️ Important:** 
- Replace `'france'` with your country's id (from Step 1)
- Update the `d="..."` attribute with the country's SVG path coordinates
- The path should roughly match the country's geographic shape

### Step 3: Generate SVG Path (Optional)
If you need accurate country shapes:

1. Visit: https://geojson-maps.kyd.au/
2. Select your country
3. Convert GeoJSON to SVG path using: https://products.aspose.app/svg/en/geojson-to-svg
4. Copy the path `d` attribute
5. Scale coordinates to fit the map (multiply by scaling factor if needed)

**OR** Use simplified shapes (rectangles, polygons) for quick setup:
```
Rectangle: "M x1 y1 L x2 y1 L x2 y2 L x1 y2 Z"
Triangle:  "M x1 y1 L x2 y2 L x3 y3 Z"
```

### Step 4: Test Your Changes
1. Save all files
2. Check the browser (auto-refresh with Vite)
3. Click on your new country
4. Verify the contact card displays correctly

## 🎨 Customization Options

### Change Map Colors
In `Contact.tsx`, modify the fill colors:
```typescript
fill={selectedCountry.id === 'tunisia' ? '#3B82F6' : '#D1D5DB'}
       // Selected color ↑            Hover ↑     Default ↑
```

### Update Card Styling
Modify `ContactCard.tsx`:
- Colors: Line 15 (gradient classes)
- Icons: Lines 31, 43, 55, 67 (SVG icons)
- Layout: Adjust Tailwind classes

### Change Animations
In `Contact.tsx`:
- Hover scale: `whileHover={{ scale: 1.05 }}`
- Pulse animation: Lines 145-152 (marker circles)
- Transition speed: `transition={{ duration: 0.3 }}`

## 📊 Current Countries
1. ✅ Tunisia
2. ✅ Morocco
3. ✅ Egypt

## 🚀 Quick Start Example

To add **United Arab Emirates**:

1. **Data** (`countryContacts.ts`):
```typescript
{
  id: 'uae',
  name: 'United Arab Emirates',
  address: 'Dubai International Financial Centre, Dubai, UAE',
  phone: '+971 4 123 4567',
  email: 'uae@orientus.com',
  workingHours: 'Sun-Thu: 9:00 AM - 6:00 PM (GMT+4)',
  coordinates: { x: 620, y: 300 },
}
```

2. **Map** (`Contact.tsx` - after Egypt path):
```typescript
{/* UAE */}
<motion.path
  id="uae"
  d="M 610 295 L 630 293 L 635 305 L 628 315 L 615 312 Z"
  fill={selectedCountry.id === 'uae' ? '#3B82F6' : hoveredCountry === 'uae' ? '#60A5FA' : '#D1D5DB'}
  stroke="#374151"
  strokeWidth="1.5"
  className="cursor-pointer transition-all duration-300"
  onClick={() => handleCountryClick('uae')}
  onMouseEnter={() => setHoveredCountry('uae')}
  onMouseLeave={() => setHoveredCountry(null)}
  whileHover={{ scale: 1.05, originX: 0.5, originY: 0.5 }}
  animate={{
    fill: selectedCountry.id === 'uae' ? '#3B82F6' : hoveredCountry === 'uae' ? '#60A5FA' : '#D1D5DB'
  }}
/>
```

3. **Done!** The country will automatically appear in:
   - The map (clickable)
   - Quick access buttons
   - Country labels with markers

## 🛠️ Troubleshooting

**Country not appearing?**
- Check that the `id` matches exactly in both files
- Verify coordinates are within bounds (x: 0-1000, y: 0-600)

**Path not visible?**
- Ensure SVG path coordinates are correct
- Check stroke and fill colors aren't matching background

**Click not working?**
- Verify `onClick={() => handleCountryClick('countryId')}` has correct id
- Check path has `className="cursor-pointer"`

## 📝 Notes
- The map auto-generates country markers and labels from the data
- Quick access buttons are created automatically
- No need to modify ContactCard.tsx when adding countries
- Default contact shows before any country selection

## 🎯 Next Steps
- Add more countries to expand your global presence
- Customize colors to match your brand
- Add country flags to contact cards
- Implement search/filter functionality

---

**Need Help?** Check the inline comments in:
- `src/data/countryContacts.ts` (Lines 36-46)
- `src/components/Contact.tsx` (Lines 69-76)
