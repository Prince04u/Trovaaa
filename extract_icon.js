const fs = require('fs');
const html = fs.readFileSync('win_my_record.html', 'utf8');
const idx = html.indexOf('My Record');
if (idx > -1) {
  const substr = html.substring(Math.max(0, idx - 1500), idx);
  const lastImg = substr.lastIndexOf('<img');
  console.log(substr.substring(lastImg));
}
