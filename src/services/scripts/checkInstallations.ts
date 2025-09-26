import { Client } from "@xmtp/node-sdk";
import { createSigner, getDbPath, getEncryptionKeyFromHex } from "../helpers/client.js";
import { WALLET_KEY, DB_ENCRYPTION_KEY, XMTP_ENV } from "../../config.js";

async function checkInstallations() {
  try {
    console.log("🔍 Checking XMTP installation status...");
    
    const signer = createSigner(WALLET_KEY);
    const encryptionKey = getEncryptionKeyFromHex(DB_ENCRYPTION_KEY);
    const dbPath = getDbPath("basecamp-agent");
    
    const client = await Client.create(signer, {
      dbEncryptionKey: encryptionKey,
      env: XMTP_ENV as "local" | "dev" | "production",
      dbPath,
    });

    const inboxState = await client.preferences.inboxState();
    const installations = inboxState.installations;
    
    console.log(`\n📊 INSTALLATION STATUS:`);
    console.log(`• Total installations: ${installations.length}/10`);
    console.log(`• Current installation ID: ${client.installationId}`);
    console.log(`• Inbox ID: ${client.inboxId}`);
    console.log(`• Address: ${inboxState.identifiers[0]?.identifier || 'Unknown'}`);
    
    console.log(`\n📋 All installations:`);
    installations.forEach((installation, index) => {
      const isCurrent = installation.installationId === client.installationId;
      console.log(`  ${index + 1}. ${installation.installationId}${isCurrent ? ' (CURRENT)' : ''}`);
    });
    
    if (installations.length >= 8) {
      console.log(`\n⚠️  WARNING: You have ${installations.length}/10 installations!`);
      console.log(`⚠️  If you reach 10, all conversations and history will be lost!`);
      console.log(`⚠️  Consider revoking old installations before deploying.`);
    }
    
    await client.close();
    
  } catch (error) {
    console.error("❌ Error checking installations:", error);
  }
}

checkInstallations().catch(console.error);
