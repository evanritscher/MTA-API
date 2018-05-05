require('dotenv').load();
const MTA = require('./mtaEngine');

const instance = new MTA();
instance.addFeed(21)
  .then(() => {
    instance.subscribeToFeed(21, (data) => console.log('21', data));
  });
instance.addFeed(1)
  .then(() => {
    instance.subscribeToFeed(1, data => console.log('1', data));
  });

// checkForTrains(feedID, stopID) {
//   const fullFeed = this.DataStore.get(feedID);
//   if (fullFeed.data) {
//     const payload = {};
//     payload.data = parseTripFeed(fullFeed.data.data, stopID);
//     if (fullFeed.error && (fullFeed.error.timestamp > fullFeed.data.timestamp)) {
//       payload.error = fullFeed.error;
//     }
//     return payload;
//   }
//   return fullFeed;
// }