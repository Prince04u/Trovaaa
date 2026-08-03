const fs = require('fs');
const html = fs.readFileSync('win_my_record.html', 'utf8');
// Find Parity Record Trophy image. It's usually near "Parity Record" or "Record</span>"
const idx = html.indexOf('Record');
if (idx > -1) {
  const substr = html.substring(Math.max(0, idx - 1500), idx);
  const lastImg = substr.lastIndexOf('<img');
  console.log("Trophy:", substr.substring(lastImg));
}
