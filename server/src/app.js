let path = require('path');
let express = require('express')
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, '..', '..', 'client')))

app.get('/', (req, res) => {
  console.error('express connection');
  res.sendFile(path.join(__dirname, '..', '..', 'client/index.html'));
});

io.on('connection', client => {
  client.emit("init", { data: 'hello world'})
});

http.listen(3000, () => console.error('listening on http://localhost:3000/'));
console.error('socket.io example');