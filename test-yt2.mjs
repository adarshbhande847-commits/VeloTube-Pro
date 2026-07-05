import { Innertube } from 'youtubei.js';
async function test() {
  try {
    const yt = await Innertube.create();
    const info = await yt.getInfo('tTKUH5caa5A');
    console.log(info.basic_info.title);
  } catch(e) {
    console.log(e);
  }
}
test();
