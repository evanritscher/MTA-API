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
    const { data, error, feedSuffix, timestamp } = payload;
    if (!this.store[feedSuffix]) {
      this.store[feedSuffix] = {};
    }

    if (error) {
      this.store[feedSuffix].error = { data, timestamp, };
    } else {
      this.store[feedSuffix].data = { data, timestamp };
    }
    if (this.subscriptions[feedSuffix]) {
      this._notify(feedSuffix);
    }


  }
  _notify(feedSuffix) {
    let dataToSend = {};

    if (this.store[feedSuffix].data) {
      if (this.store[feedSuffix].error && (this.store[feedSuffix].error.timestamp > this.store[feedSuffix].data.timestamp)) {
        dataToSend = this.store[feedSuffix];
      } else {
        dataToSend = this.store[feedSuffix].data;
      }
    } else {
      dataToSend = this.store[feedSuffix] || {};
    }

    this.subscriptions[feedSuffix].forEach(cbFunc => cbFunc(dataToSend));
  }

  addNotification(feedSuffix, cb) {
    if (!this.subscriptions[feedSuffix]) {
      this.subscriptions[feedSuffix] = [];
    }
    this.subscriptions[feedSuffix].push(cb);
  }
}
module.exports = DataStore;
