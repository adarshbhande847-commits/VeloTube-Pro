import youtubedl from 'youtube-dl-exec';

async function test() {
  const subprocess = youtubedl.exec('n_St7JxKtMk', {
    output: '-',
    format: 'bestaudio',
    noWarnings: true,
    quiet: true,
    extractorArgs: 'youtube:player_client=android'
  });
  
  let gotStdout = false;
  subprocess.stdout.on('data', d => {
    if (!gotStdout) {
        gotStdout = true;
        console.log('Got STDOUT!');
    }
  });
  
  subprocess.stderr.on('data', d => {
     console.log('STDERR:', d.toString());
  });
  
  try {
    await subprocess;
  } catch(e) {
    console.log("Failed. Got stdout?", gotStdout);
  }
}
test();
