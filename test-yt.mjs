import { Innertube } from 'youtubei.js';
async function test() {
  try {
    const yt = await Innertube.create({ generate_session_locally: true });
    const info = await yt.getBasicInfo('tTKUH5caa5A', 'ANDROID');
    console.log(info.basic_info.title);
  } catch(e) {
    console.log(e);
  }
}
test();
