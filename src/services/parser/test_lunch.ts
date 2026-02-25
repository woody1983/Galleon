import { parseNaturalLanguage } from "./localParser";

const tests = [
  "午餐",
  "午餐 35",
  "lunch",
  "lunch 35",
];

tests.forEach(input => {
  const result = parseNaturalLanguage(input);
  console.log(`"${input}" ->`, result ? {
    amount: result.amount,
    merchant: result.merchant,
    category: result.category,
  } : null);
});