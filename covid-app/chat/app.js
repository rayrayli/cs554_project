var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/chat/:id', (req, res) => {
  res.sendFile(__dirname + '/chat.html');
});

io.on('connection', function(socket) {
  let chat_id = "";

  socket.on('join_chat', function(req) {
    chat_id = req.id;
    socket.join(chat_id);
    io.in(chat_id).emit("announce", {message: `${req.user} joined @ ${new Date().toString()}`});
  });
  console.log('a user connected');

  socket.on('send_msg', function(req) {
    io.in(chat_id).emit("announce", {message: `${req.msg}`});
  });

  socket.on('disc', function(req) {
    console.log("leaving");
    console.log(req);
    io.in(chat_id).emit("announce", {message: `${req.user} has disconnected`});
  });
});

// io.on('send_msg', function(req) {
//   console.log("here");
//   io.in(req.data.id).emit("announce", {message: `New client in the req.data room @ ${new Date().toString()}`});
// });

http.listen(3000, () => {
  console.log('listening on *:3000');
});
