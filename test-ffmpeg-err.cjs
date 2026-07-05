const youtubedl = require('youtube-dl-exec');
const ffmpeg = require('fluent-ffmpeg');

const subprocess = youtubedl.exec('https://www.youtube.com/watch?v=n_St7JxKtMk', { output: '-', format: 'bestaudio' });

let ytdlError = null;

subprocess.catch(err => {
  ytdlError = err;
  console.log("YTDL ERROR:", err.message.substring(0, 50));
});

ffmpeg(subprocess.stdout)
  .audioCodec('libmp3lame')
  .format('mp3')
  .on('error', err => {
     console.log("FFMPEG ERROR:", err.message);
     if (ytdlError) {
         console.log("We already knew ytdl failed");
     } else {
         console.log("FFMPEG failed first!");
     }
  })
  .on('end', () => console.log('Done'))
  .save('output.mp3');
