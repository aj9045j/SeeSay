import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import socketInit from "../socket-io/socket";
import toast from "react-hot-toast";
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { sublime } from '@uiw/codemirror-theme-sublime'
import { githubDark } from '@uiw/codemirror-theme-github';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const connections = new Map();
const mediaMap = new Map();

const OutputModal = ({ output, onClose }) => {
    return (
        <div className="output-box" style={{ display: output ? 'block' : 'none' }}>
            <div className="output-content">
                <span className="close" onClick={onClose}>&times;</span>
                <pre>{output}</pre>
            </div>
        </div>
    );
};

export default function Interview() {
    const location = useLocation();
    const localStream = useRef(null);
    const searchParams = new URLSearchParams(location.search);
    const user = searchParams.get("userId");
    const room = searchParams.get("roomId");
    const [stream, setStream] = useState(null);
    const [remoteTracks, setRemoteTracks] = useState(new Map());
    const socketRef = useRef(null);
    const [showButton, setButton] = useState(true);
    const [output, setOutput] = useState('');
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [code, setCode] = useState(`#include<bits/stdc++.h>
using namespace std;
        
int main() {
                
}`);


    const [windowDimensions, setWindowDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const onChange = React.useCallback((value, viewUpdate) => {
        setCode(value);
        socketRef.current?.emit("code-update", ({ value: value }));

    }, []);
    socketRef.current?.on("code-change", ({ value }) => {
        setCode(value);
    })
    const changeInput = React.useCallback((value, viewUpdate) => {
        setInput(value);
    }, []);

    const handleCompile = () => {
        setIsLoading(true);
        const data = {
            code: code,
            input: input
        };
        //https://compiler-iv3c.onrender.com
        fetch('https://compiler-iv3c.onrender.com', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    setOutput(`Error: ${data.error}`);
                } else {
                    setOutput(`Output:\n${data.output}`);
                }
            })
            .catch((error) => {
                setOutput(`Error: ${error.message}`);
            }).finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleCloseModal = () => {
        setOutput('');
    };

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({
                video: {
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    frameRate: { ideal: 30, max: 60 },
                },
                audio: true,
            })
            .then(async (streams) => {
                localStream.current.srcObject = streams;
                toast.success("getting user media");
                await setStream(streams);
            })
            .catch((err) => {
                console.log(err);
                toast.error("not getting media");
            });
    }, []);

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

        toast.success("Connecting...");
        setButton(false);
        let socket = await socketInit();
        // if(render) socket = socketInit();
        socketRef.current = socket;
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

                if (connections.size > 0) {
                    socket.emit("error_sendAns", {
                        clientId: clientId,
                        socketId: socketId,
                    });
                    return;
                }

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
            socket?.on("error_setAns", ({ socketId, clientId }) => {
                toast.error("room already filled");
            })
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
        <div className='codeeditor-container'>

            <div className="container">
                <div className="code-mirror-container">
                    <CodeMirror
                        className="codemirror"
                        value={code}
                        mode="text/x-c++src"
                        extensions={[cpp()]}
                        theme={githubDark}
                        onChange={onChange}
                        height={`${windowDimensions.height - 228}px`}
                        width={`${windowDimensions.width / 1.7}px`}
                    />
                    <h2 style={{ fontFamily: "monospace", color: "white", margin: "0" }}>Input:</h2>
                    <CodeMirror
                        className='codemirror_input'
                        value={input}
                        theme={sublime}
                        height='200px'
                        width={`${windowDimensions.width / 1.7}px`}
                        onChange={changeInput}
                    />
                </div>
                <div className="button-container">
                    <button className="compile-button" onClick={handleCompile}>
                        Compile
                    </button>
                </div>
                {!isLoading ?
                    (<OutputModal output={output} onClose={handleCloseModal} />) :
                    (<div className="output-box" style={{ display: 'block' }}>
                        <SkeletonTheme baseColor="#2010" highlightColor="#445">
                            <h5 style={{ margin: "0" }}>Output</h5>
                            <Skeleton
                                count={5} />
                        </SkeletonTheme>
                    </div>
                    )

                }




            </div >
            {showButton && (<div className="button-container-1">
                <button
                    className=".button-container"
                    onClick={startConnection}
                >
                    JOIN
                </button>
            </div>
            )}


            <div className="c-video">
                <div className="video-container-1">
                    <video
                        src=""
                        muted
                        ref={localStream}
                        autoPlay
                        style={{ borderRadius: "55px", margin: "5px", backgroundColor: "black" }}
                        height="300px"
                    ></video>
                </div>

                <div>
                    {[...remoteTracks.values()].map((track, index) => {
                        console.log(remoteTracks);
                        return (
                            <div className="video-container-2">
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

            </div>
        </div>
    )
}
