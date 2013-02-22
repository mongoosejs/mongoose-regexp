var util = require('util')
var RGX = RegExp;

module.exports = exports = function (mongoose) {
  var CastError = mongoose.Error.CastError;
  var SchemaTypes = mongoose.SchemaTypes;

  function RegExp (path, options) {
    mongoose.SchemaType.call(this, path, options);
  }

  util.inherits(RegExp, mongoose.SchemaType);

  // allow { required: true }
  RegExp.prototype.checkRequired = function (value) {
    return undefined !== value;
  }

  // cast to a function
  RegExp.prototype.cast = function (val) {
    if (val instanceof RGX) return val;
    if ('string' != typeof val) {
      throw new CastError('RegExp', val, this.path)
    }
    return new RGX(val);
  }

  // query casting

  function handleSingle (val) {
    return this.castForQuery(val);
  }

  function handleArray (val) {
    var self = this;
    return val.map(function (m) {
      return self.castForQuery(m);
    });
  }

  RegExp.prototype.$conditionalHandlers = {
      '$ne' : handleSingle
    , '$in' : handleArray
    , '$nin': handleArray
    , '$gt' : handleSingle
    , '$lt' : handleSingle
    , '$gte': handleSingle
    , '$lte': handleSingle
    , '$all': handleArray
    , '$regex': handleSingle
    , '$options': handleSingle
  };

  RegExp.prototype.castForQuery = function ($conditional, val) {
    var handler;
    if (2 === arguments.length) {
      handler = this.$conditionalHandlers[$conditional];
      if (!handler) {
        throw new Error("Can't use " + $conditional + " with RegExp.");
      }
      return handler.call(this, val);
    } else {
      val = $conditional;
      return this.cast(val);
    }
  }

  /**
   * expose
   */

  if (SchemaTypes.RegExp) {
    var msg = 'A RegExp schema type is already registered.';
            + '\nAre you including it twice?'
    throw new Error(msg);
  }

  return SchemaTypes.RegExp = RegExp;
}
