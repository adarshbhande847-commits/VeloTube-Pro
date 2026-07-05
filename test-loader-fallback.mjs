async function test() {
    const url = "https://www.youtube.com/watch?v=tTKUH5caa5A";
    const format = 'audio';
    const quality = '720';
    
    const loaderFormat = format === 'video' ? (quality || '720') : 'mp3';
    console.log("loaderFormat:", loaderFormat);
    const initRes = await fetch(`https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${loaderFormat}&url=${encodeURIComponent(url)}`);
    const initData = await initRes.json();
    console.log(initData);
}
test();
