const ytpl = require('ytpl');
ytpl('https://www.youtube.com/playlist?list=PLrEnWoR732-DZJtKq-o-hR4G904R1q2Lq', { limit: 10 })
  .then(res => console.log('SUCCESS:', res.title))
  .catch(err => console.log('ERROR:', err.message));
