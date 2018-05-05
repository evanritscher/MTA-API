class DataStore {
  constructor() {
    this.store = {};
    this.subscriptions = {};
  }
  get(feedID) {
    if (!this.store[feedID]) return {};
    return this.store[feedID];
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
    this.subscriptions[feedID].forEach(cbFunc => cbFunc(this.store[feedID]));
  }

  addNotification(feedID, cb) {
    if (!this.subscriptions[feedID]) {
      this.subscriptions[feedID] = [];
    }
    this.subscriptions[feedID].push(cb);
  }
}
module.exports = DataStore;
