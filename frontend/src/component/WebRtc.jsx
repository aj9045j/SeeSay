import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import socketInit from "../socket-io/socket";
import toast from "react-hot-toast";
import { FaEnvelope } from "react-icons/fa";
import { BsMicMute, BsMicFill } from "react-icons/bs";
import { PiCameraRotateDuotone } from "react-icons/pi";
import { FiCameraOff, FiCamera } from "react-icons/fi";
const connections = new Map();
const mediaMap = new Map();

function WebRtc() {
    const location = useLocation();
    const [facingMode, setFacingMode] = useState("user");
    const searchParams = new URLSearchParams(location.search);
    const user = searchParams.get("userId");
    const room = searchParams.get("roomId");
    const myElementRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [remoteTracks, setRemoteTracks] = useState(new Map());
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);
    const [newMessage, setNewMessage] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showButton, setButton] = useState(true);

    const handleMouseMove = (event) => {
        const { clientY } = event;
        const windowHeight = window.innerHeight;
        const showThreshold = windowHeight * 0.85;
        if (clientY >= showThreshold) {
            setShowMenu(true);
        } else {
            setShowMenu(false);
        }
    };
    const handleInputChange = (event) => {
        event.preventDefault();
        const inputMessage = event.target.value;
        setMessage(inputMessage);
    };
    const handleSendMessage = () => {
        if (message.trim() !== "") {
            console.log(message);
            socketRef.current.emit("sendMessage", {
                message: message,
                roomId: room,
                userId: user,
            });

            setMessage("");
        }
    };
    const showMessage = () => {
        // setNewMessage(!newMessage);
        setShow(!show);
    };

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({
                video: { facingMode: { exact: facingMode } },
                audio: true,
            })
            .then(async (streams) => {
                myElementRef.current.srcObject = streams;
                toast.success("getting user media");
                await setStream(streams);
            })
            .catch((err) => {
                toast.error("not getting media");
            });
    }, [facingMode]);

    const changeCamera = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const rearCamera = devices.find(
            (device) =>
                device.kind === "videoinput" &&
                device.label.toLowerCase().includes("back")
        );
        if (rearCamera)
            setFacingMode((prevMode) =>
                prevMode === "environment" ? "user" : "environment"
            );
        toast.success("camera changed");
    };

    const toggleCamera = () => {
        setCameraEnabled((prevState) => !prevState);
        if (stream) {
            stream.getVideoTracks().forEach((track) => {
                track.enabled = !cameraEnabled;
            });
        }
        if (cameraEnabled) {
            toast("camera off", {
                icon: "📷",
            });
        } else {
            toast("camera on", {
                icon: "📸",
            });
        }
    };
    const toggleAudio = () => {
        setAudioEnabled((prevState) => !prevState);
        if (stream) {
            stream.getAudioTracks().forEach((track) => {
                track.enabled = !audioEnabled;
            });
        }
        if (audioEnabled) {
            toast("mic off", {
                icon: "🎙️",
            });
        } else {
            toast("mic on", {
                icon: "🎙️",
            });
        }
    };

    const handleTrack = async ({ event, clientId }) => {
        mediaMap.set(clientId, event.streams[0].id);
        await setRemoteTracks((prevRemoteTracks) =>
            new Map(prevRemoteTracks).set(event.streams[0].id, event.streams[0])
        );
    };

    const removeRemoteTrack = async (trackId) => {
        setRemoteTracks((prevRemoteTracks) => {
            const updatedRemoteTracks = new Map(prevRemoteTracks);
            updatedRemoteTracks.delete(trackId);
            return updatedRemoteTracks;
        });
    };

    const startConnection = async () => {
        toast.success("connecting....");
        setButton(false);
        let socket = await socketInit();
        console.log("streams", stream);
        // if(render) socket = socketInit();

        console.log(socket);
        socketRef.current = socket;
        socket?.on("message", (message) => {
            toast.success("new message");
            if (!show) setNewMessage(true);
            console.log(message);

            setMessages((prevMessages) => [...prevMessages, message]);
        });
        if (stream) {
            socket?.on("newUser", () => {
                socket.emit("joinUser", {
                    roomId: room,
                    userId: user,
                });
            });

            socket?.on("createOffer", async ({ roomId, clientId, socketId }) => {
                let peer = await new RTCPeerConnection({
                    iceServers: [
                        {
                            urls: [
                                "stun:stun.l.google.com:19302",
                                "stun:global.stun.twilio.com:3478",
                            ],
                        },
                    ],
                });

                peer.ontrack = (event) => {
                    handleTrack({
                        event: event,
                        clientId: clientId,
                    });
                };

                peer.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit("sendIceCandidate", {
                            roomId: room,
                            clientId: clientId,
                            candidate: event.candidate,
                        });
                    }
                };

                if (stream) {
                    await stream.getTracks().forEach((track) => {
                        peer.addTrack(track, stream);
                    });
                } else {
                    console.warn("stream not found");
                }

                await connections.set(clientId, peer);
                let offer = await peer.createOffer();
                peer.setLocalDescription(offer);

                socket.emit("sendOffer", {
                    clientId: clientId,
                    offer: offer,
                    socketId: socketId,
                });
            });

            socket?.on("createAns", async ({ clientId, offer, socketId }) => {
                let peer = await new RTCPeerConnection({
                    iceServers: [
                        {
                            urls: [
                                "stun:stun.l.google.com:19302",
                                "stun:global.stun.twilio.com:3478",
                            ],
                        },
                    ],
                });

                peer.ontrack = (event) => {
                    handleTrack({
                        event: event,
                        clientId: socketId,
                    });
                };

                peer.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit("sendIceCandidate", {
                            roomId: room,
                            clientId: clientId,
                            candidate: event.candidate,
                        });
                    }
                };
                connections.set(socketId, peer);
                if (stream) {
                    stream.getTracks().forEach((track) => {
                        peer.addTrack(track, stream);
                    });
                } else {
                    console.warn("stream not found");
                }

                await peer.setRemoteDescription(offer);
                let ans = await peer.createAnswer();

                await peer.setLocalDescription(ans);

                toast.success("new user joined");

                socket.emit("sendAns", {
                    clientId: clientId,
                    ans: ans,
                    socketId: socketId,
                });

                peer.onnegotiationneeded = async (event) => {
                    socket.emit("nego", {
                        clientId: clientId,
                        socketId: socketId,
                    });
                };
            });

            socket?.on("setAns", async ({ clientId, ans, socketId }) => {
                let peer = connections.get(clientId);
                await peer.setRemoteDescription(ans);
            });

            socket?.on("nego:coffer", async ({ socketId, clientId }) => {
                let peer = connections.get(clientId);
                let offer = await peer.createOffer();
                await peer.setLocalDescription(offer);
                socket.emit("nego:soffer", {
                    offer: offer,
                    socketId: socketId,
                    clientId: clientId,
                });
            });

            socket?.on("nego:cans", async ({ socketId, offer, clientId }) => {
                let peer = connections.get(socketId);
                await peer.setRemoteDescription(offer);
                let ans = await peer.createAnswer(offer);
                socket.emit("nego:sans", {
                    socketId: socketId,
                    ans: ans,
                    clientId: clientId,
                });
            });

            socket?.on("nego:setlocal", async ({ socketId, ans, clientId }) => {
                let peer = connections.get(clientId);
                await peer.setRemoteDescription(ans);
            });

            socket?.on("receiveIceCandidate", async ({ clientId, candidate }) => {
                candidate.usernameFragment = null;
                let peer = await connections.get(clientId);

                if (peer) {
                    await peer.addIceCandidate(candidate);
                } else {
                    console.log("Peer not found");
                }
            });

            socket?.on("removeUser", async ({ socketId }) => {
                toast.error("user leave");
                connections.delete(socketId);
                console.log("media map ehen not deleted", mediaMap);
                await removeRemoteTrack(mediaMap.get(socketId));
                mediaMap.delete(socketId);
                console.log("media map deleted", mediaMap);
            });
        }
    };

    return (
        <>
            <div onMouseMove={handleMouseMove}>
                <div className="inbox-container">
                    <div className="inbox-icon" onClick={showMessage}>
                        <FaEnvelope />
                        {newMessage && <div className="new-message-dot" />}
                    </div>
                    {show && (
                        <div className="inbox-message">
                            <div id="message-box">
                                {messages.map((msg, index) => (
                                    <div key={index} className="message">
                                        <span className="user">{msg.userId}: </span>
                                        <span className="content">{msg.message}</span>
                                    </div>
                                ))}

                                <div className="input-container">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={handleInputChange}
                                        placeholder="Type your message..."
                                    />
                                    <button onClick={handleSendMessage}>Send</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {showMenu && (
                    <div className="modify">
                        <button onClick={changeCamera}>
                            <PiCameraRotateDuotone />
                        </button>
                        <button onClick={toggleCamera}>
                            {cameraEnabled ? <FiCameraOff /> : <FiCamera />}
                        </button>
                        <button onClick={toggleAudio}>
                            {audioEnabled ? <BsMicMute /> : <BsMicFill />}
                        </button>
                    </div>
                )}

                <div className="flex">
                    <div className="video-container">
                        <video
                            src=""
                            muted
                            ref={myElementRef}
                            autoPlay
                            id="localstream"
                            style={{ borderRadius: "55px", margin: "5px" }}
                            height="300px"
                        ></video>
                    </div>

                    {[...remoteTracks.values()].map((track, index) => {
                        console.log(remoteTracks);
                        return (
                            <div className="video-container">
                                <video
                                    key={index}
                                    ref={(video) => {
                                        if (video) {
                                            video.srcObject = track;
                                        }
                                    }}
                                    playsInline
                                    autoPlay
                                    style={{ borderRadius: "55px", margin: "5px" }}
                                    height="300px"
                                    max-height="300px"
                                // width="auto"
                                ></video>
                            </div>
                        );
                    })}
                </div>

                {showButton && (
                    <button
                        style={{ position: "absolute", bottom: "17%", left: "47%" }}
                        onClick={startConnection}
                    >
                        JOIN
                    </button>
                )}
            </div>
        </>
    );
}

export default WebRtc;
