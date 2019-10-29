var ChunkyStream = require('../index');
var StreamTest = require('streamtest');
var split = require('split2');
require('chai').should();

StreamTest.versions.forEach(function (version) {
  describe('ChunkyStream ' + version, function () {
    it('should return all in one chunk', function (done) {
      var chunky = new ChunkyStream({
        interval: 0
      });

      StreamTest[version].fromChunks(['one\ntwo\nthree\nfour\n'])
        .pipe(split())
        .pipe(chunky)
        .pipe(StreamTest[version].toObjects(function (err, data) {
          if (err) {
            return done(err);
          }

          data[0].should.have.lengthOf(4);
          done();
        }));
    });

    it('should return all in one chunk', function (done) {
      var chunky = new ChunkyStream({
        interval: 0,
        ignoreEmpty: true
      });

      StreamTest[version].fromChunks(['one\ntwo\nthree\n\n'])
        .pipe(split())
        .pipe(chunky)
        .pipe(StreamTest[version].toObjects(function (err, data) {
          if (err) {
            return done(err);
          }

          data[0].should.have.lengthOf(3);
          done();
        }));
    });

    it('should return max 2 chunks at a time', function (done) {
      var chunky = new ChunkyStream({
        interval: 0
      });

      chunky.use(function (chunks) {
        return chunks.length === 2;
      });

      StreamTest[version].fromChunks(['one\ntwo\nthree\nfour\n'])
        .pipe(split())
        .pipe(chunky)
        .pipe(StreamTest[version].toObjects(function (err, data) {
          if (err) {
            return done(err);
          }

          data[0].should.have.lengthOf(2);
          data.should.have.lengthOf(2);
          done();
        }));
    });

    it('should return 3 chunks at ~250ms intervals', function (done) {
      var chunky = new ChunkyStream({
        interval: 250
      });

      StreamTest[version].fromChunks(['one\n', 'two\n', 'three\n'], 300)
        .pipe(split())
        .pipe(chunky)
        .pipe(StreamTest[version].toObjects(function (err, data) {
          if (err) {
            return done(err);
          }

          data[0].should.have.lengthOf(1);
          data.should.have.lengthOf(3);
          done();
        }));
    });

    it('should return 2 chunk at ~250ms intervals', function (done) {
      var chunky = new ChunkyStream({
        interval: 250,
        ignoreEmpty: true
      });

      StreamTest[version].fromChunks(['one\n', 'two\n', '\n'], 300)
        .pipe(split())
        .pipe(chunky)
        .pipe(StreamTest[version].toObjects(function (err, data) {
          if (err) {
            return done(err);
          }

          data[0].should.have.lengthOf(1);
          data.should.have.lengthOf(2);
          done();
        }));
    });
  });
});
