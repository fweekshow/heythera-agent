// Environment variables
export const WALLET_KEY = process.env.WALLET_KEY;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
export const XMTP_ENV = process.env.XMTP_ENV;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const DEFAULT_MODEL = process.env.DEFAULT_MODEL;

// Configurable settings
export const MENTION_HANDLES = process.env.MENTION_HANDLES || "summitconcierge";
export const DEBUG_LOGS = process.env.DEBUG_LOGS === "true";
export const SHOW_SENDER_ADDRESS = process.env.SHOW_SENDER_ADDRESS === "true";

//RSVP Backend Base Url
export const BASE_URL = process.env.BASE_URL;

// Staking System Configuration
export const STAKING_CONTRACT_ADDRESS = process.env.STAKING_CONTRACT_ADDRESS;
export const USDC_CONTRACT_ADDRESS = process.env.USDC_CONTRACT_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export const MORPHO_CONTRACT_ADDRESS = process.env.MORPHO_CONTRACT_ADDRESS || '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb';
export const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
export const BANKR_API_KEY = process.env.BANKR_API_KEY;
