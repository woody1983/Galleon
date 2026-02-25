import { parseNaturalLanguage } from "./localParser";

const tests = [
  "coffee 35",
  "coffe 35", 
  "咖啡 35",
  "starbucks 35",
  "35",
  "coffee",
];

tests.forEach(input => {
  const result = parseNaturalLanguage(input);
  console.log(`"${input}" ->`, result ? {
    amount: result.amount,
    merchant: result.merchant,
    category: result.category,
    type: result.type
  } : null);
});