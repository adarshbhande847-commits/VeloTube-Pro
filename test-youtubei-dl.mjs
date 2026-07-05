import { Innertube } from 'youtubei.js';
import fs from 'fs';
async function test() {
  try {
    const yt = await Innertube.create();
    const info = await yt.getInfo('tTKUH5caa5A');
    console.log("Got info:", info.basic_info.title);
    
    // Download audio
    const stream = await yt.download('tTKUH5caa5A', {
        type: 'audio', // audio, video or video+audio
        quality: 'best', // best, bestefficiency, 144p, 240p, 480p, 720p and so on.
        format: 'mp4' // media container format 
    });
    
    const file = fs.createWriteStream(`test.mp4`);
    for await (const chunk of stream) {
        file.write(chunk);
    }
    console.log("Downloaded!");
  } catch(e) {
    console.log(e);
  }
}
test();
