import React, { useEffect, useRef } from 'react';
import WebRtc from './WebRtc';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoom from "./pages/privateRoom";
import "./style/global.css"

function App() {

  return (


    <BrowserRouter>
      <Routes>
        <Route path="/" Component={PrivateRoom} />
        <Route path="/webrtc" Component={WebRtc}/>

      </Routes>
    </BrowserRouter>



    // <div className="App">
    //   <WebRtc roomId="45" userId="anomouyus" />
    // </div>
  );
}

export default App;
