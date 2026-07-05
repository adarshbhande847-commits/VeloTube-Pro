import youtubedl from 'youtube-dl-exec';
import fs from 'fs';

async function test() {
  const subprocess = youtubedl.exec('n_St7JxKtMk', {
    output: '-',
    format: 'bestaudio',
    noWarnings: true,
    quiet: true
  });
  
  subprocess.stdout.pipe(fs.createWriteStream('out.mp3'));
  subprocess.stderr.on('data', d => console.log('STDERR:', d.toString()));
  
  await subprocess;
  console.log("Done");
}
test();
