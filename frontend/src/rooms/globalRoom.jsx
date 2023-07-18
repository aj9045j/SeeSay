import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function GlobalRoom() {

    const [name, setName] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name === '') {
            toast.error("fill the information");
        } else {
            navigate(`/webrtc?userId=${name}&roomId=''`);
        }
    };

    const handleChange = (e) => {
        setName(e.target.value);
    };


    return (
        <div>
            <div class="login-box">
                <h1 style={{color: "white"}}>Global Room</h1>

                <form onSubmit={handleSubmit}>
                    <div class="user-box">
                        <input type="text" name="" required onChange={handleChange} />
                        <label>Username</label>
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
