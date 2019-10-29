var Transform = require('readable-stream/transform');
var util = require('util');
var reduce = require('lodash.reduce');

function ChunkyStream (options) {
  if (!(this instanceof ChunkyStream)) {
    return new ChunkyStream(options);
  }

  options.objectMode = true;
  options.writeableObjectMode = true;
  options.readableObjectMode = true;

  this.ignoreEmpty = options.ignoreEmpty;
  this.interval = options.interval;
  this.timeoutId = null;
  this.chunks = [];
  this.conditions = [];

  Transform.call(this, options);
}

util.inherits(ChunkyStream, Transform);

ChunkyStream.prototype.use = function (condition) {
  this.conditions.push(condition);
};

ChunkyStream.prototype.flush = function () {
  if (this.chunks.length === 0) {
    return;
  }

  this.push(this.chunks);
  this.chunks = [];
};

ChunkyStream.prototype.disableTimeout = function () {
  if (this.timeoutId) {
    clearTimeout(this.timeoutId);
    this.timeoutId = null;
  }
};

ChunkyStream.prototype.enableTimeout = function () {
  if (this.interval > 0) {
    this.timeoutId = setTimeout(this.flush.bind(this), this.interval);
  }
};

ChunkyStream.prototype._transform = function (chunk, encoding, callback) {
  this.disableTimeout();

  var chunks = this.chunks;
  var flush = reduce(this.conditions, function (value, condition) {
    return value || condition(chunks, chunk);
  }, false);

  if (flush) {
    this.flush();
  }

  if (!this.ignoreEmpty || (chunk && chunk.length > 0)) {
    this.chunks.push(chunk);
  }

  this.enableTimeout();

  callback();
};

ChunkyStream.prototype._flush = function (callback) {
  this.flush();
  callback();
};

module.exports = ChunkyStream;
