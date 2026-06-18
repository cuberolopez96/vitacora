const fs = require('fs');
const out = [];
for (let i = 0; i < 1000; i++) {
  out.push({
    userId: `user-${(i % 10) + 1}`,
    habitId: `habit-${(i % 50) + 1}`,
    date: `2026-01-${((i % 28) + 1).toString().padStart(2, '0')}`,
    status: ['completed','missed','skip'][i % 3],
    note: `auto ${i}`
  });
}
fs.mkdirSync('fixtures/exports', { recursive: true });
fs.writeFileSync('fixtures/exports/1k-records.json', JSON.stringify(out, null, 2));
console.log('Wrote fixtures/exports/1k-records.json with', out.length, 'records');
