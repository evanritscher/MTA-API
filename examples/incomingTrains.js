function parseTripFeed(rawFeed, stopID) {
  const parseObj = (t, s) => ({
    routeId: t.route_id,
    delay: !s.arrival ? null : s.arrival.delay,
    arrivalTime: !s.arrival ? null : new Date(s.arrival.time.low * 1000).toLocaleTimeString(),
    departureTime: !s.departure ? null : new Date(s.departure.time.low * 1000).toLocaleTimeString(),
    stopId: s.stop_id,


  });
  const filterRelevantTripSections = rawFeed.entity
    .filter(t => Object.keys(t).length > 0 && t.trip_update)
    .map(t => t.trip_update.stop_time_update
      .filter(s => (s.stop_id.indexOf(stopID) > -1))
      .map(s => parseObj(t.trip_update.trip, s)))
    .reduce((acc, curr) => [...acc, ...curr], []);
  return filterRelevantTripSections;
}


// get train arrival time for a given stopID
function incomingTrains(feed, stopID) {
  if (feed.data) {
    const payload = {};
    payload.data = parseTripFeed(feed.data, stopID);
    if (feed.error && (feed.error.timestamp > feed.data.timestamp)) {
      payload.error = feed.error;
    }
    return payload;
  }
  return feed;
}

module.exports = incomingTrains;