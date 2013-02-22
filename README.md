#mongoose-regexp
=================

Provides [Mongoose](http://mongoosejs.com) support for storing `RegExp`.

[![Build Status](https://secure.travis-ci.org/aheckmann/mongoose-regexp.png?branch=master)](http://travis-ci.org/aheckmann/mongoose-regexp)

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

[LICENSE](https://github.com/aheckmann/mongoose-regexp/blob/master/LICENSE)
