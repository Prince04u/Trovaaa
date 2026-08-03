const fs = require('fs');
const html = fs.readFileSync('win_my_record.html', 'utf8');
const cheerio = require('cheerio'); // Try using cheerio if it exists, otherwise basic string parsing
try {
  const $ = cheerio.load(html);
  // Find "My Record" text
  const myRecordHeaders = [];
  $('*').each((i, el) => {
    if ($(el).text().trim() === 'My Record' && $(el).children().length === 0) {
      myRecordHeaders.push(el);
    }
  });
  if (myRecordHeaders.length > 0) {
    let parent = $(myRecordHeaders[myRecordHeaders.length - 1]).parent().parent().parent();
    console.log(parent.html().substring(0, 2000));
  } else {
    console.log("Not found with cheerio");
  }
} catch (e) {
  const idx = html.lastIndexOf('My Record');
  if (idx > -1) {
    console.log(html.substring(Math.max(0, idx - 500), idx + 2000));
  }
}
