const fs = require('fs');
const execSync = require('child_process').execSync;
const files = execSync('git grep -il "luvomall"').toString().split('\n').filter(Boolean);
files.forEach(f => {
  if(f.includes('scratch/') || f.includes('compare.js') || f.includes('package')) return;
  let text = fs.readFileSync(f, 'utf8');
  text = text.replace(/Luvomall/g, 'Luvomall').replace(/luvomall/g, 'luvomall').replace(/LUVOMALL/g, 'LUVOMALL');
  fs.writeFileSync(f, text);
});
