import { io } from 'socket.io-client';

const socketInit = () => {
    const options = {
        'force new connection': true,
        reconnectionAttempts: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };
    return io.connect('http://localhost:5000', options);
};

export default socketInit;
//https://seesay.onrender.com