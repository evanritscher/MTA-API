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
    .catch((err) => {
      this.DataStore.set({ data: err, error: true, feedID, timestamp: Date.now() });
    });
}

function parseTripFeed(rawFeed, stopID) {
  const parseObj = (t, s) => ({
    routeId: t.route_id,
    delay: !s.arrival ? null : s.arrival.delay,
    arrivalTime: !s.arrival ? null : s.arrival.time.low,
    departureTime: !s.departure ? null : s.departure.time.low,
    timeUntil: new Date(s.arrival.time.low * 1000).toLocaleTimeString(),
  });

  const filterRelevantTripSections = rawFeed.entity
    .filter(t => Object.keys(t).length > 0 && t.trip_update)
    .map(t => t.trip_update.stop_time_update
      .filter(s => (s.stop_id.toLowerCase().indexOf(stopID) > -1))
      .map(s => parseObj(t.trip_update.trip, s)))
    .reduce((acc, curr) => [...acc, ...curr], []);
  return filterRelevantTripSections;
}

module.exports = {
  makeRequest,
  parseTripFeed
};