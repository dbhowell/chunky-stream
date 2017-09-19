# chunky-stream

Buffer up chunks and push them based on certain conditions or if a period of time has passed.
`chunk-stream` is a simple object-mode transform stream that you can pass any number of testable conditions to force a push/flush of the buffered chunks. It also has a interval feature to allow chunks to flush if a certain time has passed and no further chunks have been received.

``` js
  fs.createReadStream(file)
    .pipe(split2())
    .pipe(new ChunkyStream({ interval: 1000 }));
```

`chunky-stream` takes in the following options:
  * `interval` - The amount of time (in ms) to wait since receiving data (`0` to disable)

## API

### ChunkyStream.use(condition)
This is similar to Express middleware, `condition` is a function that will run each time a chunk is received to determine whether the buffered chunks should be released.
`condition` should have 1 argument:
  * `chunks` - The array of chunks currently buffered and not yet flushed.
`condition` should return `true` if you want to release the chunks to the consumer of the stream, `false` if you want to continue to buffer.

## Examples

### Buffer 10 text lines at a time
``` js
  var ChunkyStream = require('chunky-stream');
  var split = require('split2');
  var stream = fs.createReadStream('./test.txt');
  var chunk = new ChunkyStream();

  chunk.use(function (chunks) {
    return (chunks.length === 10);
  });

  stream.pipe(split()).pipe(chunk).on('data', function (err, lines) {
    console.log(lines);
  });
```
