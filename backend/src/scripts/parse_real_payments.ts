import fs from 'fs';
import path from 'path';

const sqlPath = path.resolve('..', 'Old Database', 'saimumor_academy.sql');
const content = fs.readFileSync(sqlPath, 'utf8');

// Parse payment rows
const paymentInserts = content.match(/INSERT INTO `payments`[^;]*;/gi) || [];

console.log(`Found ${paymentInserts.length} payment insert blocks.\n`);

interface RawPayment {
  id: string;
  user_id: string;
  department_id: string | null;
  rule_id: string | null;
  type: string | null;
  label: string | null;
  amount: string;
  status: string;
  paused_at: string | null;
  method: string | null;
  transaction_id: string | null;
  paid_at: string | null;
  due_date: string | null;
  period_year: string | null;
  period_month: string | null;
  notes: string | null;
  rule_snapshot: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  original_amount: string | null;
  discount_amount: string;
  late_fee_amount: string;
  tracking_number: string | null;
  received_by_agent_id: string | null;
  verified_by_officer_id: string | null;
  received_at: string | null;
  verified_at: string | null;
}

export function extractSqlPayments(): RawPayment[] {
  const payments: RawPayment[] = [];

  for (const insertBlock of paymentInserts) {
    const valuesPart = insertBlock.substring(insertBlock.indexOf('VALUES') + 6).trim();
    // Parse individual tuple values
    const tupleRegex = /\((.*?)\)(?:,|$|;)/gs;
    let match;
    while ((match = tupleRegex.exec(valuesPart)) !== null) {
      const rawTuple = match[1];
      // Split rawTuple safely by comma ignoring quotes
      const values: string[] = [];
      let inQuote = false;
      let currentVal = '';
      let quoteChar = '';

      for (let i = 0; i < rawTuple.length; i++) {
        const char = rawTuple[i];
        if (inQuote) {
          if (char === '\\' && i + 1 < rawTuple.length) {
            currentVal += char + rawTuple[i + 1];
            i++;
          } else if (char === quoteChar) {
            inQuote = false;
          } else {
            currentVal += char;
          }
        } else {
          if (char === "'" || char === '"') {
            inQuote = true;
            quoteChar = char;
          } else if (char === ',') {
            values.push(currentVal.trim());
            currentVal = '';
          } else {
            currentVal += char;
          }
        }
      }
      values.push(currentVal.trim());

      const clean = (v: string | undefined) => {
        if (!v || v === 'NULL' || v === 'null') return null;
        if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
          return v.substring(1, v.length - 1).replace(/\\'/g, "'").replace(/\\"/g, '"');
        }
        return v;
      };

      if (values.length >= 20) {
        payments.push({
          id: clean(values[0]) || '',
          user_id: clean(values[1]) || '',
          department_id: clean(values[2]),
          rule_id: clean(values[3]),
          type: clean(values[4]),
          label: clean(values[5]),
          amount: clean(values[6]) || '0',
          status: clean(values[7]) || '0',
          paused_at: clean(values[8]),
          method: clean(values[9]),
          transaction_id: clean(values[10]),
          paid_at: clean(values[11]),
          due_date: clean(values[12]),
          period_year: clean(values[13]),
          period_month: clean(values[14]),
          notes: clean(values[15]),
          rule_snapshot: clean(values[16]),
          created_by: clean(values[17]),
          created_at: clean(values[18]),
          updated_at: clean(values[19]),
          original_amount: clean(values[20]),
          discount_amount: clean(values[21]) || '0',
          late_fee_amount: clean(values[22]) || '0',
          tracking_number: clean(values[23]),
          received_by_agent_id: clean(values[24]),
          verified_by_officer_id: clean(values[25]),
          received_at: clean(values[26]),
          verified_at: clean(values[27])
        });
      }
    }
  }

  return payments;
}

const allPayments = extractSqlPayments();
console.log(`Successfully extracted ${allPayments.length} real payment records from saimumor_academy.sql!\n`);

// Breakdown by type
const typeCounts: Record<string, number> = {};
const statusCounts: Record<string, number> = {};
const methodCounts: Record<string, number> = {};
let totalSum = 0;
let paidSum = 0;

for (const p of allPayments) {
  const t = p.type || 'unknown';
  typeCounts[t] = (typeCounts[t] || 0) + 1;

  const s = p.status || '0';
  statusCounts[s] = (statusCounts[s] || 0) + 1;

  const m = p.method || 'Not Specified';
  methodCounts[m] = (methodCounts[m] || 0) + 1;

  const amt = parseFloat(p.amount) || 0;
  totalSum += amt;
  if (p.status === '1' || p.paid_at) {
    paidSum += amt;
  }
}

console.log('Payment Types:', typeCounts);
console.log('Payment Statuses:', statusCounts);
console.log('Payment Methods:', methodCounts);
console.log(`Total Billing Sum: ৳${totalSum.toLocaleString()}`);
console.log(`Total Paid Sum: ৳${paidSum.toLocaleString()}`);

console.log('\nSample 3 Real Payments:');
console.log(allPayments.slice(0, 3));
