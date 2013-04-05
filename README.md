#mongoose-regexp
=================

Provides [Mongoose](http://mongoosejs.com) support for storing `RegExp`.

[![Build Status](https://travis-ci.org/aheckmann/mongoose-regexp.png?branch=master)](http://travis-ci.org/aheckmann/mongoose-regexp)

Example:

```js
var mongoose = require('mongoose')
require('mongoose-regexp')(mongoose);

var mySchema = Schema({ reg: RegExp });
var M = mongoose.model('RegExp', mySchema);

var m = new M;
m.reg = /^mongodb/i;
m.save(function (err) {
  M.findById(m._id, function (err, doc) {
    var ok = m.reg.test("MongoDB allows storing RegExps!");
    console.log(ok); // true
  });
});
```

### install

```
npm install mongoose-regexp
```

### compatibility with other languages

There are no guarantees that `RegExp`s created and stored using another driver and retreived using this
module will compile or behave the same as originally intended. This module works best when it is known
that `RegExp`s stored and retrevied were generated in Node.js.

[LICENSE](https://github.com/aheckmann/mongoose-regexp/blob/master/LICENSE)
