import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './style/global.css';
import JoinRoom from './pages/joinRoom';
import WebRtc from './component/WebRtc';
import { Toaster } from 'react-hot-toast'

function App() {


  return (
    <>
      <div>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              theme: {
                primary: "#10B981",
              },
            },
          }}
        />
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={JoinRoom} />
          <Route path="/webrtc" Component={WebRtc} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
