import React, { useEffect, useState } from 'react';
import socketInit from '../socket-io/socket';
export default function Chat() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const socket = socketInit();

    useEffect(() => {

        socket.on('message', (newMessage) => {
            console.log(newMessage);
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });


    }, []);
    const handleInputChange = (event) => {
        setMessage(event.target.value);
    };

    const handleSendMessage = () => {
        if (message.trim() !== '') {
            console.log(message);
            socket.emit('sendMessage', message);
            setMessage('');
        }
    }
    return (
        <div>
            <div id="message-box">
                {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
            <div>
                <input
                    type="text"
                    value={message}
                    onChange={handleInputChange}
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    )
}
