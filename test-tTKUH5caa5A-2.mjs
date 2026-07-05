import { Innertube } from 'youtubei.js';

async function test() {
  try {
      const yt = await Innertube.create();
      const info = await yt.getBasicInfo('tTKUH5caa5A');
      console.log(info.basic_info);
  } catch(e) {
      console.log("youtubei failed:", e.message);
  }
}
test();
