class Semaphore {

  constructor(capacity) {
    this.counter = capacity;
    this.queue = [];
  }

  down() {
    return new Promise((resolve, reject) => {
      --this.counter;
      if (this.counter < 0) {
        this.queue.push(resolve);
      } else {
        resolve();
      }
    });
  }

  up() {
    ++this.counter;
    if (this.counter <= 0) {
      this.queue.shift()();
    }
  }

}

module.exports = Semaphore;
