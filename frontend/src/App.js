import React, { useEffect, useRef } from 'react';

import WebRtc from './webrtc';
import "./style/global.css"

function App() {
  
  return (
    <div className="App">
      <WebRtc roomId="45" userId="anomouyus" />
    </div>
  );
}

export default App;
