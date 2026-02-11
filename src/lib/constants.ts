export const STRIPE_CONFIG = {
  premium: {
    price_id: "price_1SzbLpKXIuUdBsrAS3DIEdp6",
    product_id: "prod_TxWOvJeeov1D3L",
    name: "Premium",
    price: 19,
    currency: "€",
    interval: "kk",
  },
} as const;

export const API_BASE = "https://api.coingecko.com/api/v3";

export const TV_SYMBOLS: Record<string, string> = {
  bitcoin: "BINANCE:BTCUSDT",
  ethereum: "BINANCE:ETHUSDT",
  ripple: "BINANCE:XRPUSDT",
  solana: "BINANCE:SOLUSDT",
  cardano: "BINANCE:ADAUSDT",
};

export const FREE_HOLDING_LIMIT = 1;
