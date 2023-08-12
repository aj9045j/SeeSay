import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { v4 as uuid } from 'uuid';

export default function PrivateRoom() {

    const [name, setName] = useState('');
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();
    const roomIdInputRef = useRef(null);

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
    const generateRoomid = () => {
        const unique_id = uuid();
        setRoomId(unique_id);
        toast.success(unique_id);
        roomIdInputRef.current.value = unique_id;
    }

    return (
        <div>
            <div class="login-box">
                <h2 style={{ color: "white" }}>Private Room</h2>
                <form>
                    <div class="user-box">
                        <input type="text" name="" required onChange={handleChange} />
                        <label>Username</label>
                    </div>
                    <div class="user-box">
                        <input ref={roomIdInputRef} name="" required onChange={handleRoomIDChange} />
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
                <p style={{display: "inline-block", color: "white"}}>don't have room id</p><a onClick={generateRoomid} style={{color: "blue", margin: "5px", textDecoration: "underLine"}}>Generate room id</a>
            </div>

        </div>
    )
}
