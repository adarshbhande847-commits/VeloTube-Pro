import youtubedl from 'youtube-dl-exec';
async function test() {
  try {
    await youtubedl('n_St7JxKtMk', {
        dumpJson: true,
        extractorArgs: 'youtube:player_client=web_creator'
    });
    console.log("Success with web_creator");
  } catch(e) { console.log("Failed with web_creator"); }
}
test();
