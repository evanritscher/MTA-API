require('dotenv').load();
const MTA = require('./lib/mtaEngine');
const incomingTrains = require('./examples/incomingTrains');

const instance = new MTA();
instance.addFeed(2, (data) => {
  const incoming = incomingTrains(data, 'L08');
  console.log(incoming);
})
  .then(() => {
    // a feed has been requested and responded successfully. 
    // you can assume there is data and new requests can be subscribed to. 
  })
  .catch((err) => {
    console.log('An error occured on the first request');
    console.log(err);
  });

