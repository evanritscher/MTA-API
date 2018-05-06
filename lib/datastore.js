class DataStore {
  constructor() {
    this.store = {};
    this.subscriptions = {};
  }
  get(feedOrStatus) {
    if (!this.store[feedOrStatus]) return {};
    return this.store[feedOrStatus];
  }
  set(payload) {
    const { data, error, feedID, timestamp } = payload;
    if (!this.store[feedID]) {
      this.store[feedID] = {};
    }

    if (error) {
      this.store[feedID].error = { data, timestamp, };
    } else {
      this.store[feedID].data = { data, timestamp };
    }
    if (this.subscriptions[feedID]) {
      this._notify(feedID);
    }


  }
  _notify(feedID) {
    let dataToSend = {};

    if (this.store[feedID].data) {
      if (this.store[feedID].error && (this.store[feedID].error.timestamp > this.store[feedID].data.timestamp)) {
        dataToSend = this.store[feedID];
      } else {
        dataToSend = this.store[feedID].data;
      }
    } else {
      dataToSend = this.store[feedID] || {};
    }

    this.subscriptions[feedID].forEach(cbFunc => cbFunc(dataToSend));
  }

  addNotification(feedID, cb) {
    if (!this.subscriptions[feedID]) {
      this.subscriptions[feedID] = [];
    }
    this.subscriptions[feedID].push(cb);
  }
}
module.exports = DataStore;
