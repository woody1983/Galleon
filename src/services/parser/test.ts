// Test script for localParser
// Run with: npx tsx src/services/parser/test.ts

import { parseNaturalLanguage, getMerchantSuggestions } from "./localParser";

console.log("🧪 Testing Local Parser\n");

const testCases = [
  { input: "星巴克 35", expected: { amount: 35, merchant: "星巴克", category: "餐饮" } },
  { input: "昨天打车28", expected: { amount: 28, merchant: "滴滴", category: "交通" } },
  { input: "工资 15000", expected: { amount: 15000, type: "income", category: "收入" } },
  { input: "咖啡 35元", expected: { amount: 35, category: "餐饮" } },
  { input: "¥99 淘宝购物", expected: { amount: 99, merchant: "淘宝", category: "购物" } },
  { input: "today 麦当劳 45块", expected: { amount: 45, merchant: "麦当劳", category: "餐饮" } },
  { input: "房租 3000", expected: { amount: 3000, merchant: "房租", category: "居住" } },
  { input: "滴滴打车 25.5元", expected: { amount: 25.5, merchant: "滴滴", category: "交通" } },
  { input: "退款 199", expected: { amount: 199, type: "income", category: "收入" } },
  { input: "", expected: null },
  { input: "乱七八糟", expected: null },
];

let passed = 0;
let failed = 0;

testCases.forEach(({ input, expected }, index) => {
  const result = parseNaturalLanguage(input);
  
  console.log(`\n${index + 1}. Input: "${input}"`);
  
  if (expected === null) {
    if (result === null) {
      console.log("   ✅ PASS - Returned null as expected");
      passed++;
    } else {
      console.log("   ❌ FAIL - Expected null but got:", result);
      failed++;
    }
    return;
  }
  
  if (result === null) {
    console.log("   ❌ FAIL - Expected result but got null");
    failed++;
    return;
  }
  
  let casePassed = true;
  
  if (expected.amount !== undefined && result.amount !== expected.amount) {
    console.log(`   ❌ Amount mismatch: expected ${expected.amount}, got ${result.amount}`);
    casePassed = false;
  }
  
  if (expected.merchant !== undefined && result.merchant !== expected.merchant) {
    console.log(`   ❌ Merchant mismatch: expected "${expected.merchant}", got "${result.merchant}"`);
    casePassed = false;
  }
  
  if (expected.category !== undefined && result.category !== expected.category) {
    console.log(`   ❌ Category mismatch: expected "${expected.category}", got "${result.category}"`);
    casePassed = false;
  }
  
  if (expected.type !== undefined && result.type !== expected.type) {
    console.log(`   ❌ Type mismatch: expected "${expected.type}", got "${result.type}"`);
    casePassed = false;
  }
  
  if (casePassed) {
    console.log("   ✅ PASS");
    console.log(`      Amount: ${result.amount}, Merchant: ${result.merchant}, Category: ${result.category}, Type: ${result.type}`);
    console.log(`      Confidence: ${result.confidence}, Needs Review: ${result.needsReview}`);
    passed++;
  } else {
    console.log("   Result:", result);
    failed++;
  }
});

console.log("\n" + "=".repeat(50));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
console.log(`   Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);

// Test merchant suggestions
console.log("\n🔍 Testing Merchant Suggestions:");
const suggestions = getMerchantSuggestions("咖啡");
console.log(`   "咖啡" suggestions: ${suggestions.join(", ")}`);

const suggestions2 = getMerchantSuggestions("star");
console.log(`   "star" suggestions: ${suggestions2.join(", ")}`);

process.exit(failed > 0 ? 1 : 0);