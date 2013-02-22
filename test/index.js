
var assert = require('assert')
var Mod = require('../')
var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var RegExpSchema;
var MongooseRegExp;

describe('MongooseRegExp', function(){
  before(function(){
    RegExpSchema = Mod(mongoose)
    MongooseRegExp = mongoose.Types.RegExp
  })

  it('has a version', function(){
    assert.equal(require('../package').version, Mod.version);
  })

  it('is a function', function(){
    assert.equal('function', typeof RegExpSchema);
  })

  it('extends mongoose.Schema.Types', function(){
    assert.ok(Schema.Types.RegExp);
    assert.equal(RegExpSchema, Schema.Types.RegExp);
  })

  it('extends mongoose.Types', function(){
    assert.ok(mongoose.Types.RegExp);
  })

  it('can be used in schemas', function(){
    var s = new Schema({ reg: RegExpSchema });
    var reg = s.path('reg')
    assert.ok(reg instanceof mongoose.SchemaType);
    assert.equal('function', typeof reg.get);

    var s = new Schema({ reg: 'RegExp' });
    var reg = s.path('reg')
    assert.ok(reg instanceof mongoose.SchemaType);
    assert.equal('function', typeof reg.get);

    var s = new Schema({ reg: RegExp });
    var reg = s.path('reg')
    assert.ok(reg instanceof mongoose.SchemaType);
    assert.equal('function', typeof reg.get);
  })

  describe('integration', function(){
    var db, S, schema, id;

    before(function(done){
      db = mongoose.createConnection('localhost', 'mongoose_regexp')
      db.once('open', function () {
        schema = new Schema({
            reg: RegExpSchema
          , docs: [{ reg: RegExp }]
        });
        S = db.model('MRegExp', schema);
        done();
      });
    })

    after(function(done){
      db.db.dropDatabase(function () {
        db.close(done);
      });
    })

    describe('casts', function(){
      it('null', function(done){
        var s = new S({ reg: null });
        assert.equal(s.reg, null);
        done();
      })

      it('strings', function(done){
        var s = new S({ reg: 'mongodb' });
        assert.ok(s.reg instanceof RegExp);
        assert.equal(s.reg.source, 'mongodb');
        done();
      })

      describe('instanceof RegExp', function(){
        it('retains flags', function(done){
          var s = new S({ reg: new RegExp('mongodb', 'img') });
          assert.ok(s.reg instanceof RegExp);
          assert.equal(s.reg.source, 'mongodb');
          assert.ok(s.reg.ignoreCase);
          assert.ok(s.reg.global);
          assert.ok(s.reg.multiline);
          done();
        })
      })

      describe('RegExp literals', function(){
        it('retains flags', function(done){
          var s = new S({ reg: /mongodb/img });
          assert.ok(s.reg instanceof RegExp);
          assert.equal(s.reg.source, 'mongodb');
          assert.ok(s.reg.ignoreCase);
          assert.ok(s.reg.global);
          assert.ok(s.reg.multiline);
          done();
        })
      })

      it('non-castables produce _saveErrors', function(done){
        var schema = new Schema({ reg: 'RegExp' }, { strict: 'throw' });
        var M = db.model('throws', schema);
        var m = new M({ reg: [] });
        m.save(function (err) {
          assert.ok(err);
          assert.equal('RegExp', err.type);
          assert.equal('CastError', err.name);
          done();
        });
      })
    })

    describe('with db', function(){
      it('save', function(done){

        var s = new S({
            reg: /mongodb/i
          , docs: [null, { reg: RegExp('10gen') } ]
        });
        id = s.id;
        s.save(function (err) {
          assert.ifError(err);
          done();
        })
      })

      it('findById', function(done){
        S.findById(id, function (err, doc) {
          assert.ifError(err);
          assert.ok(doc.reg instanceof RegExp);
          assert.ok(doc.reg.test('Mongodb'));
          assert.equal(null, doc.docs[0]);
          assert.ok(doc.docs[1].reg instanceof RegExp);
          assert.ok(doc.docs[1].reg.test(' 10gen '));
          done();
        });
      })

      it('find with RegExp literal', function(done){
        S.find({ reg: /mongodb/i }, function (err, docs) {
          assert.ifError(err);
          assert.equal(1, docs.length);
          var doc = docs[0];
          assert.equal(id, doc.id);
          done();
        });
      })

      it('findOne matching null', function(done){
        S.create({ reg: null }, function (err, doc_) {
          assert.ifError(err);
          S.findOne({ reg: null }, function (err, doc) {
            assert.ifError(err);
            assert.equal(doc_.id, doc.id);
            done();
          })
        })
      })

      it('find with instanceof RegExp', function(done){
        S.find({ 'docs.reg': new RegExp('10gen') }, function (err, docs) {
          assert.ifError(err);
          assert.equal(1, docs.length);
          var doc = docs[0];
          assert.equal(id, doc.id);
          done();
        });
      })

      it('find with string', function(done){
        S.find({ 'docs.reg': '10gen' }, function (err, docs) {
          assert.ifError(err);
          assert.equal(1, docs.length);
          var doc = docs[0];
          assert.equal(id, doc.id);
          done();
        });
      })

      it('find with string $in', function(done){
        S.find({ 'docs.reg': { $in: ['10gen', '11gen', '12gen'] }}, function (err, docs) {
          assert.ifError(err);
          assert.equal(1, docs.length);
          var doc = docs[0];
          assert.equal(id, doc.id);
          done();
        });
      })

      describe('is updateable', function(){
        it('in general', function(done){
          S.findById(id, function (err, doc) {
            assert.ifError(err);

            doc.reg = /mongodb/i
            assert.ok(!doc.isModified('reg'));

            doc.reg = new RegExp('mongodb', 'i');
            assert.ok(!doc.isModified('reg'));

            doc.reg = /^changed$/;
            doc.save(function (err) {
              assert.ifError(err);
              S.findById(id, function (err, doc) {
                assert.ifError(err);
                assert.ok(doc.reg.test('changed'));
                done();
              });
            })
          })
        })
      })

    });
  });
});
