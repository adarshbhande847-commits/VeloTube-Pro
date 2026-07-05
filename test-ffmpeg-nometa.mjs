import youtubedl from 'youtube-dl-exec';
import ffmpeg from 'fluent-ffmpeg';

async function test() {
  const subprocess = youtubedl.exec('n_St7JxKtMk', {
    output: '-',
    format: 'bestaudio',
    noWarnings: true,
    quiet: true
  });
  
  let command = ffmpeg(subprocess.stdout).format('mp3');
  let outputStream = command.pipe();
  
  outputStream.on('data', d => {
     console.log("FFmpeg outputted data!", d.length);
  });
  
  subprocess.catch(e => console.log("yt-dlp failed"));
  command.on('error', e => console.log("ffmpeg failed"));
}
test();
