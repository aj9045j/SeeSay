import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function PrivateRoom() {

    const [name, setName] = useState('');
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name === '' || roomId === '') {
            toast.error("fill the information");
        } else {
            navigate(`/webrtc?userId=${name}&roomId=${roomId}`);
        }
    };

    const handleChange = (e) => {
        setName(e.target.value);
    };

    const handleRoomIDChange = (e) => {
        setRoomId(e.target.value);
    };

    return (
        <div>
            <div class="login-box">
            <h1 style={{color: "white"}}>Private Room</h1>
                <form>
                    <div class="user-box">
                        <input type="text" name="" required onChange={handleChange} />
                        <label>Username</label>
                    </div>
                    <div class="user-box">
                        <input type="number" name="" required onChange={handleRoomIDChange} />
                        <label>RoomId</label>

                    </div>

                    <a onClick={handleSubmit}>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        Submit
                    </a>

                </form>
            </div>

        </div>
    )
}
