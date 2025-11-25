// scripts/genVapidKeys.mjs
import webPush from "web-push";

const keys = webPush.generateVAPIDKeys();

console.log("Public Key:\n", keys.publicKey);
console.log("\nPrivate Key:\n", keys.privateKey);
