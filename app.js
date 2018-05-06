require('dotenv').load();
const MTA = require('./lib/mtaEngine');
const incomingTrains = require('./examples/incomingTrains');
const subwayStatus = require('./examples/subwayStatus');

const instance = new MTA();
instance.addFeed(2, (data) => {
  const incoming = incomingTrains(data, 'L08');
  console.log(incoming); // eslint-disable-line no-console
})
  .then(() => {
    // a feed has been requested and responded successfully. 
    // you can assume there is data and new requests can be subscribed to. 
  })
  .catch((err) => {
    console.log('An error occured on the first request', err); // eslint-disable-line no-console
  });


instance.getStatus()
  .then(res => {
    const t = subwayStatus(res, '123');
    console.log(t); // eslint-disable-line no-console
  });

