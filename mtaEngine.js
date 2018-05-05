const DataStore = require('./datastore');
// const { makeRequest } = require('./utils/mta.utilities');

const axios = require('axios');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');

function makeRequest(key, feedID) {
  const requestSettings = {
    url: `http://datamine.mta.info/mta_esi.php?key=${key}&feed_id=${feedID}`,
    method: 'GET',
    responseType: 'arraybuffer',
  };
  return axios(requestSettings)
    .then((res) => {
      const feed = GtfsRealtimeBindings.FeedMessage.decode(res.data);
      this.DataStore.set({ data: feed, error: false, feedID, timestamp: Date.now() });
    })
    // throw error to allow catching in the first request from add feed. 
    // in subsequant requests if an error occurs, the error will be swallowed and not returned.
    .catch((err) => {
      this.DataStore.set({ data: err, error: true, feedID, timestamp: Date.now() });
      throw new Error(err);
    });
}

class MTA {
  constructor() {
    const _key = process.env.API_KEY;
    this.getKey = () => _key;
    this.DataStore = new DataStore();
    this.trackedFeeds = [];
  }

  addFeed(feedID, subscribeCB) {
    return new Promise((resolve, reject) => {
      if (this.trackedFeeds.includes(feedID)) {
        console.log(`The feed, ${feedID} is already being tracked`); //eslint-disable-line no-console
        return;
      }
      if (subscribeCB) {
        this.DataStore.addNotification(feedID, subscribeCB);
      }
      const boundMakeRequest = makeRequest.bind(this);

      setInterval(() => {
        boundMakeRequest(this.getKey(), feedID)
          .catch(err => err);
      }, 15000);

      // Allows you to inform the caller that the first request has gone through.
      // Will reject if fails on first request but subsequant requests will not and error is just swallowed. 
      boundMakeRequest(this.getKey(), feedID)
        .then(() => resolve())
        .catch((err) => reject(err));

      this.trackedFeeds.push(feedID);

    });
  }
  subscribeToFeed(feedID, cb) {
    this.DataStore.addNotification(feedID, cb);
    cb(this.DataStore.get(feedID));
  }
}

module.exports = MTA;
