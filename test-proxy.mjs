async function test() {
    try {
        const downloadUrl = "https://shane45.savenow.to/api/v2/download/q1pUa2vIELijsxS1YJiGVHWD0KZEVSLEtHZU8HWbOrqm3EOq";
        const res = await fetch(downloadUrl);
        console.log("Status:", res.status);
        console.log("Headers:", res.headers);
        let len = 0;
        for await (const chunk of res.body) {
             len += chunk.length;
             if (len > 1000) break;
        }
        console.log("Read", len);
    } catch(e) {
        console.error(e);
    }
}
test();
