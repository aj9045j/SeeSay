import React, { useState } from 'react';

export default function GlobalRoom() {

    const [name, setName] = useState('');
    const [roomId, setRoomId] = useState('');
  //  const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    const handleChange = (e) => {
        setName(e.target.value);
    };

    const handleRoomIDChange = (e) => {
        setRoomId(e.target.value);
    };
    const handleGlobal = (e) => {
       // navigate(`/webrtc`);
    }

    return (
        <div>
            <div class="login-box">
                <h1>Global Room</h1>

                <form onSubmit={handleSubmit}>
                    <div class="user-box">
                        <input type="text" name="" required onChange={handleChange} />
                        <label>Username</label>
                    </div>

                    <a href={`/webrtc?userId=${name}&roomId=${roomId}`}  onClick={handleSubmit}>
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
