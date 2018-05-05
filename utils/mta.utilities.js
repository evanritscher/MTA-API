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
  parseTripFeed
};

// instance.addFeed(1)
//   .then(() => {
//     instance.subscribeToFeed(1, data => console.log('1', data));
//   });

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