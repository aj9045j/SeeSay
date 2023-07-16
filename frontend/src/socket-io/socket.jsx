import { io } from 'socket.io-client';

const socketInit = () => {
    const options = {
        'force new connection': true,
        reconnectionAttempts: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };
    return io.connect('http://localhost:3001',options);
};

export default socketInit;
//https://video-call-1wu3.onrender.com