import * as XLSX from 'xlsx';

const wb = XLSX.readFile('./Andijon.xlsx');
const sheetName = wb.SheetNames[0];
const sheet = wb.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { defval: null });

console.log('Sheet names:', wb.SheetNames);
console.log('Total rows:', data.length);
console.log('First 3 rows:');
console.log(JSON.stringify(data.slice(0, 3), null, 2));
console.log('Columns:', Object.keys(data[0] as object));
