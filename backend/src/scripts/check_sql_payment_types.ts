import fs from 'fs';
import path from 'path';

const sqlPath = path.resolve('..', 'Old Database', 'saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf8');

console.log('=== REAL PAYMENT LABELS & DEFINITIONS IN SQL DUMP ===\n');

// 1. payment_definitions
const defMatches = content.match(/INSERT INTO `payment_definitions`[^;]*;/gi) || [];
console.log('--- payment_definitions table rows ---');
defMatches.forEach(m => console.log(m));

// 2. Distinct type and label in payments table
import { extractSqlPayments } from './parse_real_payments';
const payments = extractSqlPayments();

const distinctTypes = new Map<string, { count: number; labels: Set<string>; sampleAmounts: Set<string> }>();

payments.forEach(p => {
  const t = p.type || 'EMPTY';
  if (!distinctTypes.has(t)) {
    distinctTypes.set(t, { count: 0, labels: new Set(), sampleAmounts: new Set() });
  }
  const item = distinctTypes.get(t)!;
  item.count++;
  if (p.label) item.labels.add(p.label);
  if (p.amount) item.sampleAmounts.add(p.amount);
});

console.log('\n--- Distinct Payment Types & Labels in `payments` ---');
distinctTypes.forEach((data, type) => {
  console.log(`\nType: "${type}" (Total ${data.count} records)`);
  console.log(`  Labels:`, Array.from(data.labels));
  console.log(`  Sample Amounts:`, Array.from(data.sampleAmounts).slice(0, 5));
});
