async function test() {
    try {
        const title = '#travel #nature #mountains #trending #viral #boat #naturelovers #cute #beautiful';
        const url = new URL('http://localhost:3000/api/download');
        url.searchParams.set('url', 'https://www.youtube.com/watch?v=tTKUH5caa5A');
        url.searchParams.set('format', 'audio');
        url.searchParams.set('title', title);
        console.log("Fetching", url.toString());
        const res = await fetch(url.toString());
        console.log("Status:", res.status);
        let len = 0;
        for await (const chunk of res.body) {
            len += chunk.length;
            if (len > 1000) {
               console.log("Read enough bytes.");
               break;
            }
        }
    } catch(e) {
        console.error("Error:", e);
    }
}
test();
