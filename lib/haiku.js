var path = require('path');

require.paths.unshift(path.join(__dirname, '..'));

var Origami = require('haiku/origami')
  , Configuration = require('haiku/configuration')
  , Collection = require('haiku/collection')
  , fs = require('fs')
  , _ = require('underscore')

  , colors = require('colors');
;

var Haiku = Origami.extend({
  initialize: function(configObject){
    if (configObject) {
      if (Haiku.config) Haiku.config.set(configObject);
      else Haiku.configure(configObject);

      // since the attributes would be set to the configs attrs
      this.attributes = {};
    }

    this.config = Haiku.config;
    this.content = new Collection();
    this._readQueue = [];
  },

  // Reads in the source content into the haiku object structure, emits a
  // 'ready' function when the coast is clear
  read: function(){
    var haiku = this
      , contentdir = this.config.contentdir()
    ;


    // console.log('haiku.read()'.red);

    this._read(contentdir, function(err){
      if (err) throw err;

      // console.log('#read() CALLBACK'.yellow.bold);

      haiku.emit('ready');
    });
  },

  // recursive read takes a path and starts reading in files, knows when it
  // gets a directory and calls it's self
  _read: function(pathname, callback){
    // console.log('reading: '.yellow, pathname);

    haiku = this;

    haiku._readQueue.push(pathname);

    fs.stat(pathname, function(err, stats){
      if (err) throw err;

      if (stats.isDirectory()){
        fs.readdir(pathname, function(err, list){
          if (err) throw err;

          haiku._readQueue = _.without(haiku._readQueue, pathname);

          _.each(list, function(item){
            var itempath = path.join(pathname, item);
            haiku._read(itempath, callback);
          });
        });

      } else {
        haiku._readQueue = _.without(haiku._readQueue, pathname);

        haiku.content.add(pathname);

        if (_.size(haiku._readQueue) === 0){
          callback(null);
        }
      }
    });
  }
});

Haiku.configure = function(configObject){
  Haiku.config = Haiku.config || new Configuration(configObject);
};

exports = module.exports = Haiku;