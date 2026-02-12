import React, { useRef, useEffect } from "react";
import { TV_SYMBOLS } from "@/lib/constants";

interface Props {
  symbol: string;
  className?: string;
}

const TradingViewWidget: React.FC<Props> = ({ symbol, className }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure container exists
    if (!container.current) return;

    // Create script element
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    // Get correct symbol
    const symbolCode = TV_SYMBOLS[symbol] || `BINANCE:${symbol?.toUpperCase()}USDT`;

    // Configure widget
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbolCode,
      "interval": "60",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "hide_top_toolbar": false,
      "hide_legend": true,
      "save_image": false,
      "calendar": false,
      "hide_volume": true,
      "support_host": "https://www.tradingview.com",
      "backgroundColor": "rgba(17, 24, 39, 1)",
      "gridLineColor": "rgba(255, 255, 255, 0.05)",
      "overrides": {
        "paneProperties.background": "rgba(17, 24, 39, 1)",
        "paneProperties.vertGridProperties.color": "rgba(255, 255, 255, 0.05)",
        "paneProperties.horzGridProperties.color": "rgba(255, 255, 255, 0.05)",
        "scalesProperties.textColor": "#9ca3af",
      },
    });

    // Clear and append
    container.current.innerHTML = "";
    container.current.appendChild(script);

  }, [symbol]);

  return (
    <div
      className={className}
      ref={container}
      style={{ height: "100%", width: "100%", position: "relative" }}
    >
      {/* Helper text if script fails to load quickly */}
      <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 pointer-events-none z-0">
        Loading Chart...
      </div>
    </div>
  );
};

export default TradingViewWidget;
