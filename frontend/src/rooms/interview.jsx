import React, { useState } from 'react';

export default function Interview() {

    const [name, setName] = useState('');
    const [roomId, setRoomId] = useState('');
    //const navigate = useNavigate();

    const handleSubmit = (e) => {
    //    navigate(`/webrtc?userId=${name}&roomId=${roomId}`);
    };

    const handleChange = (e) => {
        setName(e.target.value);
    };

    const handleRoomIDChange = (e) => {
        setRoomId(e.target.value);
    };
    const handleGlobal = (e) => {
    //    navigate(`/webrtc`);
    }

    return (
        <div>
            <div class="login-box">

                <form onSubmit={handleSubmit}>
                    <div class="user-box">
                        <input type="text" name="" required onChange={handleChange} />
                        <label>Username</label>
                    </div>
                    <div class="user-box">
                        <input type="number" name="" required onChange={handleRoomIDChange} />
                        <label>RoomId</label>

                    </div>

                    <a href={`/webrtc?userId=${name}&roomId=${roomId}`}>
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
