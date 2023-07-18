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

    console.log("user joined", socket.id);

    socket.emit("newUser");

    socket.on("joinUser", ({ roomId, userId }) => {
        console.log("joinuser");
        connectedUsers[socket.id] = {
            roomId: roomId,
            userId: userId
        };
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

        clients.forEach((clientId) => {

            io.to(socket.id).emit("createOffer", {
                roomId: roomId,
                clientId: clientId,
                socketId: socket.id
            });

        })
        socket.join(roomId);
    })

    socket.on("sendOffer", ({ clientId, offer, socketId }) => {

        io.to(clientId).emit("createAns", {
            clientId: clientId,
            offer: offer,
            socketId: socketId
        });

    })

    socket.on("sendAns", ({ clientId, ans, socketId }) => {
        io.to(socketId).emit("setAns", ({
            clientId: clientId,
            ans: ans,
            socketId: socketId
        }));
    })

    socket.on('disconnect', async () => {

        console.log('A user disconnected', socket.id);
        if (connectedUsers[socket.id]) {
            io.to(connectedUsers[socket.id].roomId).emit('removeUser', {
                socketId: socket.id
            });
            await socket.leave(connectedUsers[socket.id].roomId);
        }
        delete connectedUsers[socket.id];

    });

    socket.on("nego", ({ clientId, socketId }) => {

        io.to(socketId).emit("nego:coffer", {
            socketId: socketId,
            clientId: clientId
        });
    })

    socket.on("nego:soffer", ({ offer, socketId, clientId }) => {

        io.to(clientId).emit("nego:cans", {
            socketId: socketId,
            offer: offer,
            clientId: clientId
        })
    })
    socket.on("nego:sans", ({ socketId, ans, clientId }) => {

        io.to(socketId).emit("nego:setlocal", {
            socketId: socketId,
            ans: ans,
            clientId: clientId
        });
    })

    socket.on('sendIceCandidate', ({ roomId, clientId, candidate }) => {

        socket.to(roomId).emit('receiveIceCandidate', { clientId, candidate });
    });


    socket.on('sendMessage', async ({ message, roomId, userId }) => {

        io.to(roomId).emit('message', {
            message: message,
            userId: userId
        });

    });

})


















const port = 3001;
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});


