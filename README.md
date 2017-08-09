# crtopdf
Converts HTML to PDF using Chrome's built-in engine.

Requires at least Chrome 59 (Chrome 60 on Windows) and Node 5.7. See `crtopdf --help` or the JSDoc for further information.

## CLI Example
Install with `npm install -g alexhorn/crtopdf`.

```
crtopdf -u https://en.wikipedia.org -o wikipedia.pdf
```

## Code Example
Install with `npm install alexhorn/crtopdf --save` or put `"crtopdf": "github:alexhorn/crtopdf"` in your dependencies.

```
var fs = require('fs');
var CrToPdf = require('crtopdf');

var pdf = new CrToPdf();

pdf.init()
.then(function () {
  pdf.convert({
    url: 'https://en.wikipedia.org'
    landscape: 'portrait',
    printBackground: true,
    format: 'a4',
    marginTop: 1,
    marginBottom: 1,
    marginLeft: 1,
    marginRight: 1,
    pageRanges: '1-5'
  });
})
.then(function (buf) {
  fs.writeFileSync('wikipedia.pdf', buf);
})
.then(function () {
  pdf.dispose();
});
```

## License
3-Clause BSD
