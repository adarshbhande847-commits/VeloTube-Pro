import fs from 'fs';
import { Readable } from 'stream';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import youtubedl from 'youtube-dl-exec';
import ytpl from 'ytpl';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import NodeID3 from 'node-id3';

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

const app = express();
const PORT = 3000;

let youtubeCookies = '';

app.use(cors());
app.use(express.json());

app.get('/api/settings', (req, res) => {
  res.json({ cookies: youtubeCookies });
});

app.post('/api/settings', (req, res) => {
  if (typeof req.body.cookies === 'string') {
    youtubeCookies = req.body.cookies;
  }
  res.json({ success: true });
});

// 1. Advanced Input Parsing
app.post('/api/parse', async (req, res) => {
  const { urls } = req.body; // array of urls from the client
  if (!Array.isArray(urls)) {
    return res.status(400).json({ error: 'urls must be an array' });
  }

  try {
    const results = [];
    for (const url of urls) {
      if (ytpl.validateID(url)) {
        // It's a playlist
        const playlist = await ytpl(url, { limit: 100 });
        results.push({
          type: 'playlist',
          url,
          id: playlist.id,
          title: playlist.title,
          channel: playlist.author.name,
          thumbnail: playlist.bestThumbnail?.url,
          items: playlist.items.map(item => ({
            id: item.id,
            url: item.shortUrl,
            title: item.title,
            channel: item.author.name,
            duration: item.duration,
            thumbnail: item.bestThumbnail?.url
          }))
        });
      } else {
        // Assume it's a single video and fetch info
        let videoId = url;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|shorts\/)([a-zA-Z0-9_-]{11})/);
        if (match && match[1]) {
           videoId = match[1];
        }
        
        try {
          const { Innertube } = await import('youtubei.js');
          const yt = await Innertube.create();
          
          const info = await yt.getBasicInfo(videoId);
          
          if (!info.basic_info.title) {
              throw new Error("Bot protection blocked youtubei.js (empty basic_info)");
          }
          
          results.push({
            type: 'video',
            url,
            id: info.basic_info.id,
            title: info.basic_info.title,
            channel: info.basic_info.author,
            duration: info.basic_info.duration,
            thumbnail: info.basic_info.thumbnail?.[0]?.url
          });
        } catch (err: any) {
          // Fallback to oEmbed API
          try {
             const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${url}&format=json`);
             if (oembedRes.ok) {
                 const oembedData = await oembedRes.json();
                 results.push({
                   type: 'video',
                   url,
                   id: videoId,
                   title: oembedData.title,
                   channel: oembedData.author_name,
                   duration: 0,
                   thumbnail: oembedData.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
                 });
                 continue; // Move to next URL
             }
          } catch(oembedErr) {
             // Silently ignore oembed errors to fallback to yt-dlp
          }
          
          // Fallback to yt-dlp if oEmbed fails
          try {
            const ytdlFlags: any = {
              dumpJson: true,
              noWarnings: true,
            };
            
            if (youtubeCookies) {
              fs.writeFileSync('cookies.txt', youtubeCookies);
            }
            if (fs.existsSync('cookies.txt')) {
              ytdlFlags.cookies = 'cookies.txt';
            }

            const info = await youtubedl(url, ytdlFlags) as any;
            results.push({
              type: 'video',
              url,
              id: info.id,
              title: info.title,
              channel: info.uploader,
              duration: info.duration,
              thumbnail: info.thumbnail
            });
          } catch (fallbackErr: any) {
             const errMsg = fallbackErr.stderr || fallbackErr.message || '';
             // We completely silence bot protection errors now as we have a functional fallback for downloading
             results.push({
               type: 'invalid',
               url
             });
          }
        }
      }
    }
    res.json(results);
  } catch (error: any) {
    console.error('Error parsing URLs:', error);
    res.status(500).json({ error: 'Failed to parse URLs', details: error.message });
  }
});

app.get('/api/download', async (req, res) => {
  const { url, format, title, channel, index, playlistTitle, quality } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).send('URL is required');
  }

  try {
    if (youtubeCookies) {
      fs.writeFileSync('cookies.txt', youtubeCookies);
    }
    
    // Default to yt-dlp only if cookies are present, because it's guaranteed to hit bot protection without cookies on this IP.
    if (youtubeCookies && fs.existsSync('cookies.txt')) {
      const ytdlFlags: any = {
        output: '-',
        cookies: 'cookies.txt'
      };

      if (format === 'video') {
        const formatStr = quality 
          ? `best[height<=${quality}][ext=mp4]/best[ext=mp4]/best` 
          : 'best[ext=mp4]/best';

        ytdlFlags.format = formatStr;

        const subprocess = youtubedl.exec(url, ytdlFlags);
        
        req.on('close', () => {
          try {
            subprocess.kill('SIGKILL');
          } catch(e) {}
        });

        let ytdlError: any = null;
        subprocess.catch((err: any) => {
          ytdlError = err;
          if (!res.headersSent) res.status(500).send('Video download error: ' + (err.stderr || err.message).slice(0, 100));
        });

        subprocess.stdout?.once('data', chunk => {
          if (!res.headersSent) {
            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Transfer-Encoding', 'chunked');
            res.status(200);
          }
          res.write(chunk);
          subprocess.stdout?.pipe(res);
        });
        
        subprocess.stdout?.on('end', () => {
          if (res.headersSent) res.end();
        });
        return;
      } else {
        ytdlFlags.format = 'bestaudio';
        const subprocess = youtubedl.exec(url, ytdlFlags);
        
        let command: any = null;
        
        req.on('close', () => {
          try {
            subprocess.kill('SIGKILL');
            if (command) command.kill('SIGKILL');
          } catch(e) {}
        });

        let ytdlError: any = null;
        subprocess.catch((err: any) => {
          ytdlError = err;
          if (!res.headersSent) res.status(500).send('Audio download error: ' + (err.stderr || err.message).slice(0, 100));
        });

        let bitrate = 192;
        if (quality && !isNaN(Number(quality))) {
          bitrate = Number(quality);
        }

        command = ffmpeg(subprocess.stdout!)
          .format('mp3')
          .audioBitrate(bitrate);

        if (title) command.outputOptions('-metadata', `title=${title}`);
        if (channel) command.outputOptions('-metadata', `artist=${channel}`);
        if (playlistTitle) command.outputOptions('-metadata', `album=${playlistTitle}`);
        if (index) command.outputOptions('-metadata', `track=${index}`);

        command.on('error', (err: any) => {
            if (!res.headersSent) res.status(500).send('FFmpeg processing error');
        });
          
        let outputStream = command.pipe();
        outputStream.once('data', (chunk: any) => {
          if (!res.headersSent) {
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Transfer-Encoding', 'chunked');
            res.status(200);
          }
          res.write(chunk);
          outputStream.pipe(res);
        });
        outputStream.on('end', () => {
          if (res.headersSent) res.end();
        });
        return;
      }
    }

    // FALLBACK: Use loader.to API to bypass bot protection completely
    const abortController = new AbortController();
    req.on('close', () => {
        abortController.abort();
    });

    const loaderFormat = format === 'video' ? (quality || '720') : 'mp3';
    const initRes = await fetch(`https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${loaderFormat}&url=${encodeURIComponent(url)}`, { signal: abortController.signal });
    const initData = await initRes.json();
    
    if (!initData.success || !initData.id) {
        return res.status(500).send('Failed to initialize download via fallback API');
    }
    
    const progressUrl = `https://lto2.affadaffa.com/api/progress?id=${initData.id}`;
    
    let downloadUrl = null;
    for (let i = 0; i < 60; i++) { // Poll for up to 2 minutes
        if (req.closed) return;
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (req.closed) return;
        
        const progRes = await fetch(progressUrl, { signal: abortController.signal });
        const progData = await progRes.json();
        
        if (progData.success === 1 && progData.download_url) {
            downloadUrl = progData.download_url;
            break;
        } else if (progData.success === 0 && progData.text && progData.text.toLowerCase().includes('error')) {
            return res.status(500).send(`Fallback API Error: ${progData.text}`);
        }
    }
    
    if (!downloadUrl) {
        return res.status(504).send('Download conversion timed out. Please try again.');
    }
    
    if (req.closed) return;
    
    // Proxy the download to bypass adblockers / CORS in the browser
    const proxyRes = await fetch(downloadUrl, { signal: abortController.signal });
    if (!proxyRes.ok) {
        return res.status(500).send('Failed to fetch from proxy url');
    }

    res.status(proxyRes.status);
    proxyRes.headers.forEach((value, key) => {
        // Exclude specific headers that might cause issues when proxying
        const excludedHeaders = [
            'connection', 'keep-alive', 'transfer-encoding', 'content-encoding', 'content-length',
            'access-control-allow-origin', 'access-control-expose-headers', 'access-control-allow-credentials'
        ];
        if (!excludedHeaders.includes(key.toLowerCase())) {
            res.setHeader(key, value);
        }
    });

    const nodeStream = Readable.fromWeb(proxyRes.body as any);
    nodeStream.pipe(res);

  } catch (err: any) {
    console.error('Download error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Download failed', details: err.message });
    }
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, watch: null },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
