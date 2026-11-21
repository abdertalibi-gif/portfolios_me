const { exec } = require('child_process');
exec('cd "C:\\Users\\Abde\\Downloads\\abderrahim-talibi---software-engineer-&-ai-developer (2)" && npx tsc --noEmit', { maxBuffer: 1024*1024 }, (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  if (stderr) {
    console.error('Stderr:', stderr);
    return;
  }
  console.log('Stdout:', stdout ? stdout.substring(0, 3000) : 'none');
});