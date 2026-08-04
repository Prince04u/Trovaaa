const https = require('https');
https.get('https://bruzoo.games', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const cssMatch = data.match(/href="([^"]+\.css)"/g);
    if(cssMatch) {
      cssMatch.forEach(css => {
        let url = css.split('"')[1];
        if(!url.startsWith('http')) url = 'https://bruzoo.games' + url;
        console.log('Found CSS:', url);
        https.get(url, (cRes) => {
          let cData = '';
          cRes.on('data', cd => cData += cd);
          cRes.on('end', () => {
            console.log('--- ' + url + ' ---');
            const lines = cData.split('}');
            lines.forEach(l => {
              if (l.includes('.mine_top') || l.includes('.mine_info') || l.includes('.balance') || l.includes('.one_btn') || l.includes('.refresh')) {
                console.log(l.trim() + '}');
              }
            });
          });
        });
      });
    }
  });
});
