require('dotenv').load();
const MTA = require('./mtaEngine');

const instance = new MTA();
instance.addFeed(1, (data) => console.log('21', data))
  .catch(err => console.log('An error occured on the first request'))
;
// .then(() => {
//   instance.subscribeToFeed(21, (data) => console.log('subbed after the fact, ', data));
// });
