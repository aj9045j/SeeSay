import React, { useState } from 'react';
import PrivateRoom from '../rooms/privateRoom';
import GlobalRoom from '../rooms/globalRoom';
import Interview from '../rooms/interview';

export default function JoinRoom() {
    const [currentPage, setCurrentPage] = useState(null);

    const handlePrivateRoomClick = () => {
        setCurrentPage('private');
    };

    const handleGlobalRoomClick = () => {
        setCurrentPage('global');
    };

    const handleInterviewClick = () => {
        setCurrentPage('interview');
    };


    if (currentPage === 'private') {
        return <PrivateRoom />;
    }
    if (currentPage === 'global') {
        return <GlobalRoom />;
    }
    if (currentPage === 'interview') {
        return <Interview />;
    }
    return (
        <div>
            <div className="login-box">
                <button onClick={handlePrivateRoomClick}>Private</button>
                <button onClick={handleGlobalRoomClick}>Global</button>
                <button onClick={handleInterviewClick}>Interview</button>
            </div>
            {/* {renderCurrentPage()} */}
        </div>
    );
};

    // return ;

