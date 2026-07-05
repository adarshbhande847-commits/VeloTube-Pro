import youtubedl from 'youtube-dl-exec';
async function test() {
  try {
    await youtubedl('n_St7JxKtMk', {
        dumpJson: true,
        extractorArgs: 'youtube:player_client=ios'
    });
    console.log("Success with ios");
  } catch(e) { console.log("Failed with ios"); }
}
test();
