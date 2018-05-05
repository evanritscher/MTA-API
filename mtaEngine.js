const DataStore = require('./datastore');
const { makeRequest } = require('./utils/mta.utilities');
class MTA {
  constructor() {
    this.key = process.env.API_KEY;
    this.DataStore = new DataStore();
    this.trackedFeeds = [];
  }

  addFeed(feedID, subscribeCB) {
    return new Promise((resolve) => {
      if (this.trackedFeeds.includes(feedID)) {
        console.log(`The feed, ${feedID} is already being tracked`); //eslint-disable-line no-console
        return;
      }
      if (subscribeCB) {
        this.DataStore.addNotification(feedID, subscribeCB);
      }
      const boundMakeRequest = makeRequest.bind(this);

      setInterval(() => {
        boundMakeRequest(this.key, feedID);
      }, 15000);

      // Allows you to inform the caller that the first request has gone through. 
      // Could be unsuccessful but it's gone through.
      boundMakeRequest(this.key, feedID)
        .then(() => resolve());

      this.trackedFeeds.push(feedID);

    });
  }
  subscribeToFeed(feedID, cb) {
    this.DataStore.addNotification(feedID, cb);
    cb(this.DataStore.get(feedID));
  }
}

module.exports = MTA;
