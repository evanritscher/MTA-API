const axios = require('axios');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
const DataStore = require('./datastore');
const { promisify } = require('util');
const { parseString } = require('xml2js');
const promisedParseString = promisify(parseString);

const lineToFeedSuffix = new Proxy({
  'A|C|E': '-ace',
  'B|D|F|M': '-bdfm',
  'G': '-g',
  'J|Z': '-jz',
  'N|Q|R|W': '-nqrw',
  'L': '-l',
  '1|2|3|4|5|6': '',
  '7': '-7',
  'SIR': '-sir'
},
{
  get: function(target, prop, reciever) {
    for (key in target) {
      if (new RegExp(key).test(prop.toUpperCase())) return target[key]
    }
    return null;
  }
})

function getFeed(key, feedSuffix) {
  const requestSettings = {
    url: `https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs${feedSuffix}`,
    headers: {
      'x-api-key': key,
    },
    method: 'GET',
    responseType: 'arraybuffer',
  };
  return axios(requestSettings)
    .then((res) => {
      const feed = GtfsRealtimeBindings.FeedMessage.decode(res.data);
      this.DataStore.set({ data: feed, error: false, feedSuffix, timestamp: Date.now() });
    })
    // throw error to allow catching in the first request from add feed. 
    // in subsequant requests if an error occurs, the error will be swallowed and not returned.
    .catch((err) => {
      this.DataStore.set({ data: err, error: true, feedSuffix, timestamp: Date.now() });
      throw new Error(err);
    });
}

function getSystemStatus() {
  const URL = 'http://web.mta.info/status/serviceStatus.txt';
  return axios.get(URL)
    .then(res => promisedParseString(res.data))
    .then(r => {
      this.DataStore.set({ data: r, error: false, feedID: 'systemStatus', timestamp: Date.now() });
      return this.DataStore.get('systemStatus');
    })
    .catch((err) => {
      this.DataStore.set({ data: err, error: true, feedID: 'systemStatus', timestamp: Date.now() });
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

  addFeed(lineID, subscribeCB) {
    return new Promise((resolve, reject) => {
      const feedSuffix = lineToFeedSuffix[lineID];
      if (this.trackedFeeds.includes(feedSuffix)) {
        console.log(`The feed, ${feedSuffix} is already being tracked`); //eslint-disable-line no-console
        return;
      }
      if (subscribeCB) {
        this.DataStore.addNotification(feedSuffix, subscribeCB);
      }
      const boundGetFeed = getFeed.bind(this);

      setInterval(() => {
        boundGetFeed(this.getKey(), feedSuffix)
          .catch(err => err);
      }, 15000);

      // Allows you to inform the caller that the first request has gone through.
      // Will reject if fails on first request but subsequant requests will not and error is just swallowed. 
      boundGetFeed(this.getKey(), feedSuffix)
        .then(() => resolve())
        .catch((err) => reject(err));

      this.trackedFeeds.push(feedSuffix);

    });
  }
  subscribeToFeed(feedID, cb) {
    this.DataStore.addNotification(feedID, cb);
    cb(this.DataStore.get(feedID));
  }
  getStatus() {
    const status = this.DataStore.get('systemStatus');
    const fifteenMinutesAgo = Date.now() - 900000;
    if (!Object.keys(status).length || status.timestamp < fifteenMinutesAgo) {
      return getSystemStatus.bind(this)();
    } else {
      // always return a promise even when sync so there's one expectation on how to consume data.
      return new Promise(resolve => resolve(this.DataStore.get('systemStatus')));
    }
  }
}

module.exports = MTA;
