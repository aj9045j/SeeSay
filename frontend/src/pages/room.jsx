import React, { useEffect, useRef } from "react";
import WebRtc from '../WebRtc';
import socketInit from '../socket-io/socket';
import Chat from '../messages/chat';

export default function Room() {
    const socketRef = useRef(null);

    useEffect(() => {
        const initializeSocket = async () => {
            const initializedSocket = await socketInit();
            socketRef.current = initializeSocket;
        };

        initializeSocket();
    }, []);

    useEffect(() => {
        if (socketRef.current) {
            // Socket has been initialized, you can perform any necessary actions here
        }
    }, [socketRef.current]);



    return (
        <div>
            {/* {console.log("socket from joinb user",socket)} */}
            {/* <Chat socket={socketRef.current}/> */}
            <WebRtc />
        </div>
    );
}
