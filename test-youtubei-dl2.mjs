import { Innertube, UniversalCache } from 'youtubei.js';

async function test(clientName) {
  const yt = await Innertube.create({ clientType: clientName });
  
  try {
    const stream = await yt.download('n_St7JxKtMk', {
      type: 'audio+video',
      quality: 'best',
      client: clientName
    });
    
    console.log(clientName, "Stream obtained!");
  } catch (err) {
    console.error(clientName, "ERROR:", err.info ? err.info.error_type : err.message);
  }
}

async function run() {
  await test('WEB');
  await test('ANDROID');
  await test('IOS');
  await test('TV_EMBEDDED');
}
run();
