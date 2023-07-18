import { io } from 'socket.io-client';

const socketInit = () => {
    const options = {
        'force new connection': true,
        reconnectionAttempts: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };
    return io.connect('https://video-call-1wu3.onrender.com',options);
};

export default socketInit;
//https://video-call-1wu3.onrender.com