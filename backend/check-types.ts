import * as XLSX from 'xlsx';

const wb = XLSX.readFile('./Andijon.xlsx');
const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: null }) as any[];

const uniqueTypes = [...new Set(data.map((r) => r.objectTypeId))].sort();
console.log('Unique objectType names in Excel:', uniqueTypes.length);
console.log(JSON.stringify(uniqueTypes, null, 2));
