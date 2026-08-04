fetch('http://localhost:3000/admin/results').then(r=>r.text()).then(t => { 
  const regex = /<script>window\.__NEXT_DATA__=(.*?)<\/script>/; 
  const match = t.match(regex); 
  if (match) { 
    console.log(match[1].substring(0, 1000)); 
  } else {
    console.log('NEXT_DATA not found. Extracting react errors...');
    const errMatch = t.match(/Error:([^"]+)/g);
    console.log(errMatch);
  } 
})
