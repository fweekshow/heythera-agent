import { Client } from "@xmtp/node-sdk";
import { createSigner, getDbPath, getEncryptionKeyFromHex } from "@/services/helpers/client.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const WALLET_KEY = process.env.WALLET_KEY;
const DB_ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY;
const XMTP_ENV = process.env.XMTP_ENV || "production";

if (!WALLET_KEY) {
  throw new Error("WALLET_KEY is required");
}

if (!DB_ENCRYPTION_KEY) {
  throw new Error("DB_ENCRYPTION_KEY is required");
}

async function revokeInstallations() {
  try {
    console.log("🔄 Starting installation revocation process...");
    
    const signer = createSigner(WALLET_KEY);
    const encryptionKey = getEncryptionKeyFromHex(DB_ENCRYPTION_KEY);
    
    // Get the wallet address
    const identifier = signer.getIdentifier();
    console.log(`📋 Wallet address: ${identifier.identifier}`);
    
    // Use the known inbox ID from the error message
    const inboxId = "dcf776a22ef6e54bb0c07dd55844be3ede8148650af53164ebf12914dcd4a2a4";
    console.log(`📋 Using known Inbox ID: ${inboxId}`);
    
    // Get inbox state to find installations
    console.log("🔍 Retrieving inbox state...");
    const inboxStates = await Client.inboxStateFromInboxIds([inboxId], XMTP_ENV as "local" | "dev" | "production");
    
    if (!inboxStates || inboxStates.length === 0) {
      console.log("⚠️ No inbox states found - no installations to revoke");
      return;
    }
    
    const inboxState = inboxStates[0];
    console.log(`📊 Found ${inboxState.installations.length} installations`);
    
    if (inboxState.installations.length <= 1) {
      console.log("ℹ️ Only one or no installations found, nothing to revoke");
      return;
    }
    
    // Revoke ALL installations (like clear-installations.mjs does)
    const installationsToRevoke = inboxState.installations.map((installation) => installation.bytes);
    
    console.log(`🗑️ Revoking ${installationsToRevoke.length} installations...`);
    
    // Revoke all installations
    await Client.revokeInstallations(signer, inboxId, installationsToRevoke, XMTP_ENV as "local" | "dev" | "production");
    
    console.log("✅ Successfully revoked old installations!");
    console.log(`🎯 Kept 1 installation, revoked ${installationsToRevoke.length}`);
    
  } catch (error: any) {
    console.error("❌ Installation revocation failed:", error);
    console.log(`Code: ${error.code}`);
    console.log(`Message: ${error.message}`);
    throw error;
  }
}

console.log("🧹 XMTP Installation Revoker");
console.log(`📍 Environment: ${XMTP_ENV}`);

revokeInstallations()
  .then(() => {
    console.log("✅ Installation revocation completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Revocation failed:", error);
    process.exit(1);
  });