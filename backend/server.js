const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*"
    }
});
const connectedUsers = {};
io.on("connection", (socket) => {


    console.log("new user connected", socket.id);
    socket.emit("newUser");

    socket.on("joinUser", ({ roomId, userId }) => {



        connectedUsers[socket.id] = {
            userId: roomId,
            userId: userId
        };

        console.log("joinuser emit");
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        console.log(clients);
        clients.forEach((clientId) => {
            console.log(clientId);
            io.to(socket.id).emit("createOffer", { roomId: roomId, clientId: clientId, socketId: socket.id });
        })
        socket.join(roomId);
    })

    socket.on("sendOffer", ({ clientId, offer, socketId }) => {

        io.to(clientId).emit("createAns", { clientId: clientId, offer: offer, socketId: socketId });
        //console.log(roomId,clientId);
    })

    socket.on("sendAns", ({ clientId, ans, socketId }) => {
        console.log(ans);
        console.log(clientId);
        io.to(socketId).emit("setAns", ({ clientId: clientId, ans: ans, socketId: socketId }));
    })

    socket.on('disconnect', () => {
        const disconnectedUser = connectedUsers[socket.id];
        console.log('A user disconnected');
        socket.leave(disconnectedUser.roomId);
        delete connectedUsers[socket.id];

    });
    socket.on("nego", ({ clientId, socketId }) => {
        io.to(socketId).emit("nego:coffer", { socketId: socketId, clientId: clientId });
    })
    socket.on("nego:soffer", ({ offer, socketId, clientId }) => {
        io.to(clientId).emit("nego:cans", { socketId: socketId, offer: offer, clientId: clientId })
    })
    socket.on("nego:sans", ({ socketId, ans, clientId }) => {
        io.to(socketId).emit("nego:setlocal", { socketId: socketId, ans: ans, clientId: clientId });

    })
    socket.on('sendIceCandidate', ({ roomId, clientId, candidate }) => {
        console.log(`Sending ICE candidate from ${socket.id} to room ${roomId} (client: ${clientId})`);
        socket.to(roomId).emit('receiveIceCandidate', { clientId, candidate });
    });

})


















const port = 3001;
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});