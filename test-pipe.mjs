import youtubedl from 'youtube-dl-exec';

async function test() {
  const subprocess = youtubedl.exec('n_St7JxKtMk', {
    output: '-',
    format: 'bestaudio',
    noWarnings: true,
    quiet: true
  });
  
  let gotStdout = false;
  subprocess.stdout.on('data', d => {
    gotStdout = true;
    console.log('STDOUT length:', d.length);
    console.log('STDOUT content:', d.toString());
  });
  
  try {
    await subprocess;
  } catch(e) {
    console.log("Failed. Got stdout?", gotStdout);
  }
}
test();
