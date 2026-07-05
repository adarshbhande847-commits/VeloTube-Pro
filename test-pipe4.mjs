import express from 'express';
import youtubedl from 'youtube-dl-exec';
import ffmpeg from 'fluent-ffmpeg';
import fetch from 'node-fetch'; // if available

const app = express();
app.get('/test', (req, res) => {
  const subprocess = youtubedl.exec('n_St7JxKtMk', {
    output: '-',
    format: 'bestaudio',
    noWarnings: true,
    quiet: true
  });
  
  res.setHeader('Content-Type', 'audio/mpeg');
  let command = ffmpeg(subprocess.stdout).format('mp3');
  
  command.pipe(res, { end: true });
});

const server = app.listen(3002, async () => {
  console.log("Server listening");
  const resp = await fetch('http://localhost:3002/test');
  console.log("Response status:", resp.status);
  const text = await resp.text();
  console.log("Response length:", text.length);
  server.close();
});
