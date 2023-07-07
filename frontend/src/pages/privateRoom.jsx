import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PrivateRoom() {
    const [name, setName] = useState('');
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        navigate(`/webrtc?userId=${name}&roomId=${roomId}`);
    };

    const handleChange = (e) => {
        setName(e.target.value);
    };

    const handleRoomIDChange = (e) => {
        setRoomId(e.target.value);
    };
    const handleGlobal = (e) => {
        navigate(`/webrtc`);
    }
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>
                    Enter your name:
                    <input type="text" value={name} onChange={handleChange} required/>
                </label>
                <label>
                    Enter Room ID:
                    <input type="text" value={roomId} onChange={handleRoomIDChange} required/>
                </label>
                <input type="submit" value="Submit" />
                <button onClick={handleGlobal}>Global room</button>
            </form>
            
        </div>
    );
}
