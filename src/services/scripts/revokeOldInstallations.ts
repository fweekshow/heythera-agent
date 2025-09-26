import { Client } from "@xmtp/node-sdk";
import { createSigner, getDbPath, getEncryptionKeyFromHex } from "../helpers/client.js";
import { WALLET_KEY, DB_ENCRYPTION_KEY, XMTP_ENV } from "../../config.js";

async function revokeOldInstallations() {
  try {
    console.log("🔍 Checking installations to revoke...");
    
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
    const currentInstallationId = client.installationId;
    
    console.log(`\n📊 Current status: ${installations.length}/10 installations`);
    console.log(`🔧 Current installation: ${currentInstallationId}`);
    
    // Find installations to revoke (keep current + 1 backup)
    const installationsToRevoke = installations
      .filter(inst => inst.installationId !== currentInstallationId)
      .slice(0, -1); // Keep one backup installation
    
    if (installationsToRevoke.length === 0) {
      console.log("✅ No old installations to revoke.");
      return;
    }
    
    console.log(`\n🗑️  Will revoke ${installationsToRevoke.length} old installations:`);
    installationsToRevoke.forEach((inst, index) => {
      console.log(`  ${index + 1}. ${inst.installationId}`);
    });
    
    console.log(`\n⚠️  This will free up installation slots but may disconnect old clients.`);
    console.log(`⚠️  Current installation and conversations will remain safe.`);
    
    // Uncomment the next lines to actually revoke (for now just showing what would happen)
    /*
    for (const installation of installationsToRevoke) {
      console.log(`🗑️ Revoking installation: ${installation.installationId}`);
      await client.revokeInstallation(installation.installationId);
    }
    */
    
    console.log(`\n💡 To actually revoke, uncomment the revocation code in the script.`);
    console.log(`💡 This will reduce your installation count and make room for Railway deployment.`);
    
  } catch (error) {
    console.error("❌ Error managing installations:", error);
  }
}

revokeOldInstallations().catch(console.error);
