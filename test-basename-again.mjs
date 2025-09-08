// Test script to check basename resolution with different approaches
import { getName } from '@coinbase/onchainkit/identity';
import { base, mainnet } from 'viem/chains';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testBasenameResolution() {
  const testAddress = "0x22209cfc1397832f32160239c902b10a624cab1a";
  
  console.log("🧪 Testing basename resolution (attempt 2)...");
  console.log(`📋 Test address: ${testAddress}`);
  
  try {
    // Test 1: OnchainKit with Base chain
    console.log("\n🔍 Test 1: OnchainKit with Base chain...");
    const basenameBase = await getName({ 
      address: testAddress, 
      chain: base 
    });
    console.log(`Result: ${basenameBase} (type: ${typeof basenameBase})`);
    
    // Test 2: OnchainKit with mainnet (for ENS names)
    console.log("\n🔍 Test 2: OnchainKit with mainnet (for ENS)...");
    const basenameMainnet = await getName({ 
      address: testAddress, 
      chain: mainnet 
    });
    console.log(`Result: ${basenameMainnet} (type: ${typeof basenameMainnet})`);
    
    // Test 3: Try a known address that definitely has a basename
    console.log("\n🔍 Test 3: Testing with Coinbase CEO's known address...");
    const knownAddress = "0x7c04786f04c522ca664bb8b6804e0d182eec505f"; // Brian Armstrong's address
    const knownBasename = await getName({ 
      address: knownAddress, 
      chain: base 
    });
    console.log(`Result for known address: ${knownBasename} (type: ${typeof knownBasename})`);
    
    // Summary
    console.log("\n📊 Summary:");
    console.log(`Your address basename (Base): ${basenameBase || 'None found'}`);
    console.log(`Your address ENS (Mainnet): ${basenameMainnet || 'None found'}`);
    console.log(`Known address basename: ${knownBasename || 'None found'}`);
    
    return basenameBase || basenameMainnet;
    
  } catch (error) {
    console.error(`❌ Error during testing:`, error);
    return null;
  }
}

console.log("🚀 Comprehensive Basename Resolution Test");
testBasenameResolution()
  .then((result) => {
    if (result) {
      console.log(`\n🎉 Found a name: "${result}"`);
    } else {
      console.log(`\n💭 No basename/ENS found for your address`);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Test failed:", error);
    process.exit(1);
  });
