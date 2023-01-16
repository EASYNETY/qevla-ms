// socket.io.js
const socketio = require('socket.io');

let io;

const socketApi = {
    init: (server) => {
        io = socketio(server);
        return io;
    },
    getIo: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};

module.exports = socketApi;
