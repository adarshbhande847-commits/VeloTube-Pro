import ytdl from '@distube/ytdl-core';
async function test() {
  try {
    let info = await ytdl.getInfo('tTKUH5caa5A');
    console.log("Title:", info.videoDetails.title);
  } catch(e) {
    console.log(e);
  }
}
test();
