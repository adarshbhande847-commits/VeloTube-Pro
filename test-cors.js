const express = require('express');
const cors = require('cors');
const http = require('http');
const app = express();
app.use(cors());
app.get('/', (req, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.send('ok');
});
const server = app.listen(0, () => {
  const port = server.address().port;
  http.get(`http://localhost:${port}/`, (res) => {
    console.log("Header:", res.headers['access-control-allow-origin']);
    process.exit(0);
  });
});
