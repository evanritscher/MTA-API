require('dotenv').load();
const MTA = require('./mtaEngine');

const instance = new MTA();
instance.addFeed(21, (data) => console.log('21', JSON.stringify(data)));
// .then(() => {
//   instance.subscribeToFeed(21, (data) => console.log('subbed after the fact, ', data));
// });
