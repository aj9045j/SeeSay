import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './style/global.css';
import JoinRoom from './pages/joinRoom';
import WebRtc from './WebRtc';

function App() {
  

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JoinRoom />} />
        <Route path="/webrtc" element={<WebRtc />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
