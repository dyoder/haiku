
var express = require('express')
  , _ = require('underscore')
  , Haiku = require('haiku')
  , express = require('express')
  , sys = require('sys')
;

var Server = function(attrs){
  var server = this;

  server.haiku = new Haiku({ source: attrs.source });
  server.port = attrs.port;

  server.app = express.createServer();

  server.app.configure('development', function(){
    server.app.use(express.errorHandler({
      dumpExceptions: true, showStack: true
    }));
  });

  server.app.configure(function(){
    server.app.use(express.static(server.haiku.publicdir()));
  });

  server.app.get('/', function(req, res){

    index = server.haiku.content['/index.html'];

    if (index){
      index.render(function(html){
        res.send(html);
      });
    } else {
      res.send('not found', 404)
    }
  });


  server.app.get(/^\/(.*)/, function(req, res){
    var key = '/' + req.params[0]
        content = server.haiku.content[key];
    ;

    if (content){
      content.render(function(html){
        res.send(html);
      });
    } else {
      res.send('not found', 404);
    }
  });
};

Server.prototype.run = function(){
  var server = this;

  server.haiku.on('ready', function(){
    var message = 'haiku is running! //====>> http://localhost:' + server.port;
    sys.puts(message)

    // console.log('partials:'.yellow.inverse);
    //
    // _.each(server.haiku.partials, function(value, key, list){
    //   var type = typeof value;
    //   console.log((('  ' + key + ': ').yellow) + type);
    // });
    //
    // console.log('content:'.yellow.inverse);
    //
    // _.each(server.haiku.content, function(value, key, list){
    //   console.log((('  ' + key + ' ').magenta));
    //   value.get('content')();
    // });
    //
    // var badSeed = server.haiku.content['/blog/atom.xml.xml']
    // console.log('\n BAD SEED! \n'.bold.red.inverse, badSeed.parser());

    // badSeed.get('content')();
    //
    // var pathname = this.get('file').replace(/(.*)\/content\//g, '')
    //     originalExtension = path.extname(this.get('file'))
    //     buildpath = pathname.replace(originalExtension, this._extension())

    server.app.listen(server.port);
  });

  sys.puts('reading: ' + this.haiku.get('source'))
  sys.puts('...')

  server.haiku.read();
};


exports = module.exports = Server;