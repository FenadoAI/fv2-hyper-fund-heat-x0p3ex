# Hyperliquid Funding Tracker

A real-time web application that visualizes Hyperliquid perpetual futures funding rates as an interactive heatmap, helping traders identify high-yield funding opportunities.

## Features

### 🎨 Interactive Heatmap
- **Color-coded visualization** of annualized funding returns
- Grid layout displays all 213+ perpetual assets
- Intuitive color scheme:
  - **Green** = Positive funding (long positions earn)
  - **Red** = Negative funding (short positions earn)
  - Intensity indicates magnitude (darker = higher returns)

### 🎚️ Liquidity Filter
- **Draggable slider** to filter assets by liquidity (in USD millions)
- Real-time filtering updates the heatmap instantly
- Shows asset count: "Showing X of Y assets"

### 📊 Asset Details Modal
Clicking any asset opens a detailed popup with:
- **Annualized Return** (funding rate × 24 hours × 365 days)
- **Hourly Funding Rate** (raw funding rate)
- **Mark Price** (current perpetual contract price)
- **Liquidity** (open interest in USD)
- **24h Volume** (trading volume)
- **Premium** (perpetual vs spot price difference)
- **Direct link** to trade on Hyperliquid platform

### ⚡ Real-time Updates
- Auto-refreshes every 30 seconds
- Manual refresh button available
- Displays last update timestamp

## Technical Implementation

### Backend API (`/api/hyperliquid/data`)
- **Framework**: FastAPI with async httpx client
- **Data Source**: Hyperliquid public API (`https://api.hyperliquid.xyz/info`)
- **Endpoint**: `metaAndAssetCtxs` provides real-time market data
- **Processing**:
  - Calculates annualized returns from hourly funding rates
  - Computes liquidity in USD (open interest × mark price)
  - Handles missing/invalid data gracefully
- **Response**: JSON array of 213+ assets with funding metrics

### Frontend (React)
- **Component**: `HyperliquidTracker.jsx`
- **UI Library**: shadcn/ui (Card, Dialog, Slider, Badge, Button)
- **Styling**: Tailwind CSS with gradient backgrounds
- **Icons**: lucide-react (TrendingUp, TrendingDown, ExternalLink, RefreshCw)
- **State Management**: React hooks (useState, useEffect)
- **API Communication**: Axios with auto-retry

### Color Scheme Logic
```javascript
| Annualized Return Range | Color           | Meaning              |
|-------------------------|-----------------|----------------------|
| > +50%                  | Dark Green      | Strong long funding  |
| +20% to +50%            | Medium Green    | Good long funding    |
| +10% to +20%            | Light Green     | Moderate long        |
| +5% to +10%             | Very Light Green| Small long           |
| -5% to +5%              | Gray            | Neutral              |
| -10% to -5%             | Very Light Red  | Small short          |
| -20% to -10%            | Light Red       | Moderate short       |
| -50% to -20%            | Medium Red      | Good short funding   |
| < -50%                  | Dark Red        | Strong short funding |
```

## API Endpoints

### GET `/api/hyperliquid/data`
Returns processed funding data for all perpetual assets.

**Response:**
```json
{
  "success": true,
  "assets": [
    {
      "name": "BTC",
      "funding_rate": 0.0000125,
      "annualized_return": 10.95,
      "mark_price": 114441.0,
      "open_interest": 32194.9323,
      "day_volume": 2435314322.27,
      "liquidity_usd": 3684420247.34,
      "premium": -0.0003843231
    }
  ]
}
```

## Usage

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

### Frontend
```bash
cd frontend
bun install
bun start
```

### Production
```bash
# Backend
sudo supervisorctl restart backend

# Frontend
sudo supervisorctl restart frontend
```

## How to Use the Tracker

1. **View the Heatmap**: Open the application to see all assets color-coded by annualized return
2. **Filter by Liquidity**: Drag the slider to show only assets with sufficient liquidity (e.g., $1M+)
3. **Explore Assets**: Click any asset tile to view detailed metrics
4. **Trade Opportunity**: Green = earn by going long, Red = earn by going short
5. **Trade on Hyperliquid**: Click "Trade on Hyperliquid" button in the modal to open the asset's trading page

## Key Metrics Explained

- **Annualized Return**: Expected yearly profit from funding alone (assuming rate stays constant)
- **Funding Rate**: Hourly payment between longs and shorts
- **Liquidity**: Total open interest value in USD (higher = more liquid market)
- **Premium**: Difference between perpetual and spot price (drives funding)

## Success Criteria ✅

- [x] Real-time heatmap visualization of funding rates
- [x] Draggable liquidity filter (in USD millions)
- [x] Clickable asset tiles with detailed popups
- [x] Direct links to Hyperliquid trading platform
- [x] Auto-refresh every 30 seconds
- [x] Mobile-responsive grid layout
- [x] Professional design with modern UI components
- [x] 213+ assets tracked in real-time

## Dependencies Added

### Backend
- `httpx>=0.27.0` - Async HTTP client for Hyperliquid API

### Frontend
- All UI components from shadcn/ui already available
- lucide-react icons (TrendingUp, TrendingDown, ExternalLink, RefreshCw)

## Example High-Yield Opportunities (as of testing)

| Asset | Annualized Return | Strategy | Liquidity |
|-------|------------------|----------|-----------|
| SUPER | -512.53% | Short | $2.28M |
| 0G | -314.06% | Short | $1.91M |
| APEX | +130.06% | Long | $32.93M |
| XPL | +110.89% | Long | $714.88M |

*Note: Funding rates change constantly. Always verify current rates before trading.*