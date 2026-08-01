const fs = require('fs');
const https = require('https');

https.get('https://bruzoo.games/api/webapi/GetGoodsList?pageSize=10&pageNo=1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("API response:", data.substring(0, 500));
  });
}).on('error', e => console.log(e));
