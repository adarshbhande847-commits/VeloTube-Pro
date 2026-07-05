async function test() {
    try {
        const url = "http://localhost:3000/api/download?url=https://www.youtube.com/watch?v=tTKUH5caa5A&format=audio";
        console.log("Fetching", url);
        const res = await fetch(url);
        console.log("Response:", res.status, res.headers.get('content-type'));
        
        const chunks = [];
        let length = 0;
        for await (const chunk of res.body) {
            chunks.push(chunk);
            length += chunk.length;
            if (length > 10000) break; // just read a bit
        }
        console.log("Read", length, "bytes");
    } catch (e) {
        console.error("Fetch error:", e);
    }
}
test();
