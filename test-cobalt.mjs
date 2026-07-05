import fetch from 'node-fetch';
async function test() {
  const r = await fetch('https://api.cobalt.tools/api/json', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: 'https://www.youtube.com/watch?v=tTKUH5caa5A',
      vQuality: '720'
    })
  });
  console.log(r.status);
  console.log(await r.text());
}
test();
