import youtubedl from 'youtube-dl-exec';
import { Innertube } from 'youtubei.js';

async function test() {
  try {
      const yt = await Innertube.create();
      const info = await yt.getBasicInfo('tTKUH5caa5A');
      console.log("youtubei title:", info.basic_info.title);
  } catch(e) {
      console.log("youtubei failed:", e.message);
  }
}
test();
