// Simple manual message sender using the same setup as the main agent
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

// Use the exact same helper functions as the main agent
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

const getDbPath = (description = "xmtp") => {
  const volumePath = process.env.RAILWAY_VOLUME_MOUNT_PATH ?? ".data/xmtp";
  if (!fs.existsSync(volumePath)) {
    fs.mkdirSync(volumePath, { recursive: true });
  }
  return `${volumePath}/${description}.db3`;
};

const getEncryptionKeyFromHex = (hex) => {
  return new Uint8Array(Buffer.from(hex, 'hex'));
};

async function sendManualMessage(targetAddress, message) {
  try {
    console.log("🚀 Connecting to XMTP with same config as main agent...");
    
    const signer = createSigner(WALLET_KEY);
    const encryptionKey = getEncryptionKeyFromHex(DB_ENCRYPTION_KEY);
    
    // Use the same database path as the main agent
    const dbPath = getDbPath("railway-agent");
    
    console.log(`📁 Using database path: ${dbPath}`);
    
    const client = await Client.create(signer, {
      dbEncryptionKey: encryptionKey,
      env: XMTP_ENV,
      dbPath,
    });
    
    console.log(`📋 Agent Address: ${client.address}`);
    console.log(`🎯 Target Address: ${targetAddress}`);
    
    // Sync conversations first
    await client.conversations.sync();
    
    // Try to find existing conversation first
    const conversations = await client.conversations.list();
    let conversation = conversations.find(conv => 
      conv.peerAddress?.toLowerCase() === targetAddress.toLowerCase()
    );
    
    if (!conversation) {
      console.log("💬 Creating new DM conversation...");
      conversation = await client.conversations.newDm(targetAddress);
    } else {
      console.log("💬 Using existing conversation...");
    }
    
    console.log("📤 Sending message...");
    await conversation.send(message);
    
    console.log("✅ Message sent successfully!");
    console.log(`📝 Message: "${message}"`);
    console.log(`📬 To: ${targetAddress}`);
    
    return true;
    
  } catch (error) {
    console.error("❌ Error sending message:", error);
    return false;
  }
}

// Target wallet and message
const targetWallet = "0x22209cfc1397832f32160239c902b10a624cab1a";
const testMessage = "Hi! This is a test message from the Basecamp 2025 Concierge agent. The agent is now active and ready to help with Basecamp information, schedules, and reminders!";

console.log("📨 Manual Message Sender for Basecamp Agent");
console.log(`📍 Environment: ${XMTP_ENV}`);

sendManualMessage(targetWallet, testMessage)
  .then((success) => {
    if (success) {
      console.log("🎉 Manual message sent successfully!");
    } else {
      console.log("💥 Failed to send message");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
