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
    console.log(clientName, "ERROR:", err.message);
  }
}
test('TV_EMBEDDED');
