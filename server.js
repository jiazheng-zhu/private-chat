var express = require('express');
var app = express();
app.use(express.static('public'));

var http = require('http');
var server = http.createServer(app);

var io = require('socket.io')(server);

var clients = [];

io.on('connection', (socket) => {
    console.log('A new client has connected: ' + socket.id);

    
    socket.on('newUser', (data) =>{
        clients.push({
            id: socket.id,
            username: data
        })
        socket.broadcast.emit('newUserJoined', data);
        io.emit('updatedUserList', clients);
    })

    socket.on('sendMessage', (msgData)=>{
        io.emit('newMessage', msgData);
    })
    socket.on('sendPrivateMessage', (msgData) => {
        io.to(msgData.sendTo.id).emit('newPrivateMessage', msgData);
    })
    

    socket.on('disconnect', () =>{
        socket.broadcast.emit('userDisconnected', socket.username);
        for(var i = 0; i <= clients.length; i++){
            if (clients[i].id == socket.id) {
                clients.splice(i, 1);
                io.emit('updatedUserList', clients);
                break;
            }
        }
        console.log('Client ' + socket.id + ' has disconnected from server.');
    })
})

server.listen(3000, ()=>{
    console.log('Server is running on http://localhost:3000');
})