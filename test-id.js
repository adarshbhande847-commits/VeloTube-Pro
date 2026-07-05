function extractId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}
console.log(extractId('https://www.youtube.com/watch?v=n_St7JxKtMk'));
console.log(extractId('https://youtu.be/n_St7JxKtMk'));
console.log(extractId('https://youtube.com/shorts/n_St7JxKtMk?feature=share'));
console.log(extractId('n_St7JxKtMk'));
