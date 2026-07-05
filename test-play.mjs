import play from 'play-dl';
async function test() {
  try {
    let stream = await play.stream('tTKUH5caa5A');
    console.log("Stream:", stream.type);
  } catch(e) {
    console.log(e);
  }
}
test();
