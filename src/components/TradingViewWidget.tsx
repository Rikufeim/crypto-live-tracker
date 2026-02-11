import React, { useRef, useEffect } from "react";
import { TV_SYMBOLS } from "@/lib/constants";

interface Props {
  symbol: string;
  className?: string;
}

const TradingViewWidget: React.FC<Props> = ({ symbol, className }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: TV_SYMBOLS[symbol] || `BINANCE:${symbol?.toUpperCase()}USDT`,
      interval: "60",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1", // candlesticks (default TradingView look)
      locale: "en",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: true,
      save_image: false,
      backgroundColor: "rgba(0, 0, 0, 0)",
      overrides: {
        "paneProperties.background": "rgba(0, 0, 0, 0)",
        "paneProperties.vertGridProperties.color": "rgba(148, 163, 184, 0.08)",
        "paneProperties.horzGridProperties.color": "rgba(148, 163, 184, 0.08)",
        "scalesProperties.textColor": "#9ca3af",
      },
    });

    if (container.current) {
      container.current.innerHTML = "";
      container.current.appendChild(script);
    }
  }, [symbol]);

  return (
    <div
      className={className ?? "h-[380px] md:h-[480px] lg:h-[520px] w-full"}
      ref={container}
    >
      <div className="h-full w-full" />
    </div>
  );
};

export default TradingViewWidget;
