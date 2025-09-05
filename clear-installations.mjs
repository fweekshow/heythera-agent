// Working installation revocation script
import { Client, IdentifierKind } from "@xmtp/node-sdk";
import { createWalletClient, http, toBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WALLET_KEY = process.env.WALLET_KEY;
const DB_ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY;
const XMTP_ENV = process.env.XMTP_ENV || 'production';

// Helper functions - exact same as working client.ts
const createSigner = (key) => {
  const sanitizedKey = key.startsWith("0x") ? key : `0x${key}`;
  const account = privateKeyToAccount(sanitizedKey);
  const wallet = createWalletClient({
    account,
    chain: sepolia,
    transport: http(),
  });

  return {
    type: "EOA",
    getIdentifier: () => ({
      identifierKind: IdentifierKind.Ethereum,
      identifier: account.address.toLowerCase(),
    }),
    signMessage: async (message) => {
      const signature = await wallet.signMessage({
        message,
        account: account,
      });
      return toBytes(signature);
    },
  };
};

const getDbPath = (description) => {
  const volumePath = path.join(__dirname, ".data", "xmtp");
  if (!fs.existsSync(volumePath)) {
    fs.mkdirSync(volumePath, { recursive: true });
  }
  return `${volumePath}/${description}.db3`;
};

const getEncryptionKeyFromHex = (hexString) => {
  return new Uint8Array(Buffer.from(hexString, 'hex'));
};

async function clearInstallations() {
  try {
    console.log("🔄 Starting installation clearing process...");
    
    const signer = createSigner(WALLET_KEY);
    const encryptionKey = getEncryptionKeyFromHex(DB_ENCRYPTION_KEY);
    
    // Get the wallet address
    const identifier = signer.getIdentifier();
    console.log(`📋 Wallet address: ${identifier.identifier}`);
    
    // Use known inbox ID
    const inboxId = "dd1cdcedc414c0ac7e0050a214beca7e89421c969c7b9a9aefa8c5420f21a35d";
    console.log(`📋 Inbox ID: ${inboxId}`);
    
    // Get inbox state
    console.log("🔍 Retrieving inbox state...");
    const inboxStates = await Client.inboxStateFromInboxIds([inboxId], XMTP_ENV);
    
    if (!inboxStates || inboxStates.length === 0) {
      console.log("⚠️ No inbox states found");
      return;
    }
    
    const inboxState = inboxStates[0];
    console.log(`📊 Found ${inboxState.installations.length} installations`);
    
    if (inboxState.installations.length <= 1) {
      console.log("ℹ️ Only one or no installations found, nothing to clear");
      return;
    }
    
    // Get installation bytes for revocation
    const installationsToRevoke = inboxState.installations.map((installation) => installation.bytes);
    
    console.log(`🗑️ Clearing ${installationsToRevoke.length} installations...`);
    
    // Revoke all installations
    await Client.revokeInstallations(signer, inboxId, installationsToRevoke, XMTP_ENV);
    
    console.log("✅ Successfully cleared all installations!");
    
  } catch (error) {
    console.error("❌ Installation clearing failed:", error);
    console.log(`Code: ${error.code}`);
    console.log(`Message: ${error.message}`);
    process.exit(1);
  }
}

console.log("🧹 XMTP Installation Cleaner");
console.log(`📍 Environment: ${XMTP_ENV}`);

clearInstallations()
  .then(() => {
    console.log("✅ Installation clearing completed!");
    console.log("🔄 Agent can now create fresh installation");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Clearing failed:", error);
    process.exit(1);
  });
