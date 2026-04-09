import * as XLSX from 'xlsx';

const wb = XLSX.readFile('./Andijon.xlsx');
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: null }) as any[];

// Find "Temir yo'l stansiyasi" row and print char codes
const sample = rows.find((r) => r.objectTypeId?.includes('stansiyasi'));
if (sample) {
  console.log('Excel value:', JSON.stringify(sample.objectTypeId));
  console.log('Char codes:', [...sample.objectTypeId].map((c: string) => `${c}:U+${c.charCodeAt(0).toString(16).toUpperCase()}`).join(' '));
}

// Compare with our seed value
const seed = "Temir yo'l stansiyasi";
console.log('\nSeed value:', JSON.stringify(seed));
console.log('Seed char codes:', [...seed].map((c) => `${c}:U+${c.charCodeAt(0).toString(16).toUpperCase()}`).join(' '));
