import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./style/global.css";
import JoinRoom from "./pages/joinRoom";
import WebRtc from "./component/WebRtc";
import { Toaster } from "react-hot-toast";
import MobileDetect from "mobile-detect";

function App() {
  
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const md = new MobileDetect(window.navigator.userAgent);
    setIsMobile(md.mobile() !== null);
  }, []);

  if (isMobile) {
    return (
      <div className="error-message">
        <h1>Oops! Mobile Access Restricted</h1>
        <p>We're sorry, but this website is not available on mobile devices.</p>
      </div>
    );
  }
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
