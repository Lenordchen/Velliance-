var express = require('express')
var app = express();
var http = require("http").Server(app);
var io = require('socket.io')(http);
var port = 3000;
var fs = require('fs');

//database to store data

var Datastore = require('nedb');
var db = new Datastore({filename: "data.db", autoload: true});


app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res){
  res.render('index.ejs',{'title':'Hello World'});
});

io.on('connection', function(socket){

	console.log('A new user connected: ' + socket.id);

	socket.on('chat message', function(msg){
		io.emit('message received', msg);


  //Create the Javascript Object

  var datatosave = {
    socketid: socket.id,
    message: msg
  }

  //Insert the data into database
  db.insert(datatosave, function (err, newDocs) {
    if (err) {
console.log("err: " + err);

    }

    console.log("newDocs: " + newDocs);
  });

  //Send it to all of the clients
    io.emit('chatmessage', msg);
  });

  // When the history is requested, find all of the docs in the database
  socket.on('history', function() {
    db.find({}, function(err, docs) {
      // Loop through the results, send each one as if it were a new chat message
      for (var i = 0; i < docs.length; i++) {
        socket.emit('chatmessage', docs[i].message);
      }
    })
  });

	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

http.listen(port, function(){
  console.log('listening on *:3000');
});
