import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8001';
const API = `${API_BASE}/api`;

const HyperliquidTracker = () => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liquidityFilter, setLiquidityFilter] = useState([0]);
  const [maxLiquidity, setMaxLiquidity] = useState(1000);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API}/hyperliquid/data`);

      if (response.data.success) {
        const sortedAssets = response.data.assets.sort((a, b) =>
          Math.abs(b.annualized_return) - Math.abs(a.annualized_return)
        );
        setAssets(sortedAssets);

        // Calculate max liquidity for slider
        const max = Math.max(...sortedAssets.map(a => a.liquidity_usd));
        setMaxLiquidity(Math.ceil(max / 1000000)); // Convert to millions

        setLastUpdate(new Date());
      } else {
        setError(response.data.error || "Failed to fetch data");
      }
    } catch (e) {
      console.error("Error fetching Hyperliquid data:", e);
      setError("Failed to fetch data from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Filter assets based on liquidity
    const minLiquidityUSD = liquidityFilter[0] * 1000000;
    const filtered = assets.filter(asset => asset.liquidity_usd >= minLiquidityUSD);
    setFilteredAssets(filtered);
  }, [assets, liquidityFilter]);

  const getColorForReturn = (annualizedReturn) => {
    const absReturn = Math.abs(annualizedReturn);
    if (absReturn > 50) return annualizedReturn > 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)";
    if (absReturn > 20) return annualizedReturn > 0 ? "rgb(74, 222, 128)" : "rgb(248, 113, 113)";
    if (absReturn > 10) return annualizedReturn > 0 ? "rgb(134, 239, 172)" : "rgb(252, 165, 165)";
    if (absReturn > 5) return annualizedReturn > 0 ? "rgb(187, 247, 208)" : "rgb(254, 202, 202)";
    return "rgb(229, 231, 235)";
  };

  const formatNumber = (num, decimals = 2) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(decimals)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(decimals)}K`;
    return `$${num.toFixed(decimals)}`;
  };

  const formatPercentage = (num) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  if (loading && assets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <RefreshCw className="animate-spin" />
          Loading Hyperliquid data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="p-8 bg-red-950/50 border-red-800">
          <p className="text-red-400 text-lg">{error}</p>
          <Button onClick={fetchData} className="mt-4" variant="outline">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero Section with Background */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1920&q=80)',
            filter: 'blur(2px)'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">
                Hyperliquid Funding Tracker
              </h1>
              <p className="text-slate-300 text-lg">
                Real-time funding rates with annualized returns • Track 213+ perpetual assets
              </p>
            </div>
          <div className="text-right">
            <Button
              onClick={fetchData}
              variant="outline"
              size="sm"
              className="gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {lastUpdate && (
              <p className="text-slate-500 text-sm mt-2">
                Last update: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Liquidity Filter */}
        <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm mb-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-300">
                Minimum Liquidity (USD)
              </label>
              <Badge variant="secondary" className="bg-blue-900/50 text-blue-300">
                {formatNumber(liquidityFilter[0] * 1000000)}+
              </Badge>
            </div>
            <Slider
              value={liquidityFilter}
              onValueChange={setLiquidityFilter}
              max={maxLiquidity}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>$0</span>
              <span>{formatNumber(maxLiquidity * 1000000)}</span>
            </div>
            <div className="text-sm text-slate-400 text-center">
              Showing {filteredAssets.length} of {assets.length} assets
            </div>
          </div>
        </Card>

      {/* Heatmap Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {filteredAssets.map((asset) => (
            <Card
              key={asset.name}
              className="p-4 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl border-2"
              style={{
                backgroundColor: getColorForReturn(asset.annualized_return),
                borderColor: Math.abs(asset.annualized_return) > 20 ? 'white' : 'transparent'
              }}
              onClick={() => setSelectedAsset(asset)}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <p className="font-bold text-lg text-slate-900">{asset.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  {asset.annualized_return > 0 ? (
                    <TrendingUp className="w-4 h-4 text-slate-900" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-slate-900" />
                  )}
                  <p className="font-semibold text-sm text-slate-900">
                    {formatPercentage(asset.annualized_return)}
                  </p>
                </div>
                <p className="text-xs text-slate-700 mt-1">
                  {formatNumber(asset.liquidity_usd)}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">
              No assets match the current liquidity filter
            </p>
          </div>
        )}

      {/* Legend */}
        <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Color Legend (Annualized Return)</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "rgb(34, 197, 94)" }}></div>
              <span className="text-sm text-slate-400">&gt;50% (Long)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "rgb(74, 222, 128)" }}></div>
              <span className="text-sm text-slate-400">20-50% (Long)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "rgb(134, 239, 172)" }}></div>
              <span className="text-sm text-slate-400">10-20% (Long)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "rgb(229, 231, 235)" }}></div>
              <span className="text-sm text-slate-400">0-10%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "rgb(252, 165, 165)" }}></div>
              <span className="text-sm text-slate-400">-10 to -20% (Short)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "rgb(248, 113, 113)" }}></div>
              <span className="text-sm text-slate-400">-20 to -50% (Short)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "rgb(239, 68, 68)" }}></div>
              <span className="text-sm text-slate-400">&lt;-50% (Short)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Asset Detail Modal */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {selectedAsset?.name}
              <Badge
                variant={selectedAsset?.annualized_return > 0 ? "default" : "destructive"}
                className="text-sm"
              >
                {selectedAsset?.annualized_return > 0 ? "Long" : "Short"}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Perpetual futures funding details
            </DialogDescription>
          </DialogHeader>

          {selectedAsset && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-400">Annualized Return</p>
                  <p className="text-2xl font-bold mt-1" style={{
                    color: selectedAsset.annualized_return > 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"
                  }}>
                    {formatPercentage(selectedAsset.annualized_return)}
                  </p>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-400">Hourly Funding Rate</p>
                  <p className="text-2xl font-bold mt-1">
                    {(selectedAsset.funding_rate * 100).toFixed(4)}%
                  </p>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-400">Mark Price</p>
                  <p className="text-xl font-bold mt-1">
                    ${selectedAsset.mark_price.toFixed(4)}
                  </p>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-400">Liquidity (OI)</p>
                  <p className="text-xl font-bold mt-1">
                    {formatNumber(selectedAsset.liquidity_usd)}
                  </p>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-400">24h Volume</p>
                  <p className="text-xl font-bold mt-1">
                    {formatNumber(selectedAsset.day_volume)}
                  </p>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-400">Premium</p>
                  <p className="text-xl font-bold mt-1">
                    {(selectedAsset.premium * 100).toFixed(4)}%
                  </p>
                </div>
              </div>

              <div className="bg-blue-950/30 border border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-300 mb-2">
                  <strong>Opportunity:</strong>
                  {selectedAsset.annualized_return > 0 ? (
                    <span> Long positions earn funding at an annualized rate of {formatPercentage(selectedAsset.annualized_return)}.</span>
                  ) : (
                    <span> Short positions earn funding at an annualized rate of {formatPercentage(Math.abs(selectedAsset.annualized_return))}.</span>
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  Funding is paid hourly based on the difference between perpetual and spot prices.
                </p>
              </div>

              <Button
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => window.open(`https://app.hyperliquid.xyz/trade/${selectedAsset.name}`, '_blank')}
              >
                Trade on Hyperliquid
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HyperliquidTracker;