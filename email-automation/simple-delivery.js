#!/usr/bin/env node
// Simple Email Delivery System
const fs = require('fs');
const DB_PATH = '/home/rustwood/.openclaw/workspace/email-automation/subscribers.json';
const PRODUCTS = {
  'local-ai': { name: 'Local AI in Plain English', file: 'local-ai-plain-english.md' },
  'workflow': { name: 'Your First AI Workflow', file: 'your-first-ai-workflow.md' }
};
function addSubscriber(email, product) {
  let db = fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH)) : {};
  if (!db[email]) db[email] = { products: [], subscribed: Date.now() };
  if (!db[email].products.includes(product)) db[email].products.push(product);
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  return true;
}
function deliver(email, productKey) {
  const product = PRODUCTS[productKey];
  if (!product) return { error: 'Product not found' };
  addSubscriber(email, productKey);
  const token = Buffer.from(`${email}:${productKey}:${Date.now()}`).toString('base64');
  return { success: true, email, product: product.name, token };
}
module.exports = { deliver };
