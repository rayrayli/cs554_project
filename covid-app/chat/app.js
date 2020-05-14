app = require('express.io')()
app.http().io()

app.get('/chat/:id', function(req, res) {
  res.sendfile(__dirname + '/client.html');
});

app.io.route('join_chat', function(req) {
  req.io.join(req.data);
  req.io.room(req.data).broadcast('announce', {
    message: `New client in the req.data room @ ${new Date().toString()}`
  })
});

app.io.route('send_msg', function(req) {
  req.io.join(req.data.id);
  req.io.room(req.data.id).broadcast('announce', {
    message: req.data.msg.toString()
  });
  req.io.respond({msg: "ok"});
});

app.io.route('disc', function(req) {
  req.io.join(req.data.id);
  req.io.room(req.data.id).broadcast('announce', {
    message: `${req.data.user} has disconnected`
  });
});

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/client.html');
});

app.listen(7076)