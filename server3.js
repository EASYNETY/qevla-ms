const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(3001, () => {
  console.log('Server listening on port 3001');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.put('/user/update/:id', (req, res) => {
    Item.findByIdAndUpdate(req.params.id, { $set: req.body }, (err, item) => {
      if (err) return res.status(500).send(err);
    //   io.emit('update', item);
      return res.send(item);
    });
  });

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('updateData', (data) => {
    console.log('Received data:', data);
    io.emit('newData', data);
  });
});
