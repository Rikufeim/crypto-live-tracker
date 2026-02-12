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
  dogecoin: "BINANCE:DOGEUSDT",
  polkadot: "BINANCE:DOTUSDT",
  "avalanche-2": "BINANCE:AVAXUSDT",
  chainlink: "BINANCE:LINKUSDT",
  "matic-network": "BINANCE:MATICUSDT",
  litecoin: "BINANCE:LTCUSDT",
  uniswap: "BINANCE:UNIUSDT",
};

export const FREE_HOLDING_LIMIT = 1;
