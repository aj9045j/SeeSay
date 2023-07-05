import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const connections = new Map();

function WebRtc({ roomId, userId }) {
    const myElementRef = useRef(null);
    const [renderCount, setRenderCount] = useState(0);
    const [stream, setStream] = useState(null);
    const [remoteTracks, setRemoteTracks] = useState(new Map());

    useEffect(() => {
        console.log('render');
        setRenderCount(prevCount => prevCount + 1);
    }, []);

    useEffect(() => {
        console.log(roomId, userId);
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            console.log(stream);
            console.log(myElementRef);
            myElementRef.current.srcObject = stream;
            setStream(stream);
            console.log('stream from navigation', stream);
        });
    }, []);

    const handleTrack = async event => {

        console.log('hey from peer.ontrack', event);
        const track = await event.track;
        console.log(track);
        await setRemoteTracks(prevRemoteTracks => new Map(prevRemoteTracks).set(event.streams[0].id, event.streams[0]));
        console.log("enet.streams[0]", event.streams[0])
        console.log(event.streams[0].id);
        // myremote.current.srcObject = await event.streams[0];
    };


    useEffect(() => {
        if (stream) {
            const socket = io.connect('https://video-call-1wu3.onrender.com');
            console.log('socket', socket);

            socket.on('newUser', () => {
                console.log('newuser emit');
                socket.emit('joinUser', {
                    roomId: roomId,
                    userId: userId
                });
            });




            //handleTrack();
            socket.on('createOffer', async ({ roomId, clientId, socketId }) => {
                let peer = await new RTCPeerConnection({
                    iceServers: [
                        {
                            urls: [
                                'stun:stun.l.google.com:19302',
                                'stun:global.stun.twilio.com:3478'
                            ]
                        }
                    ]
                });
                peer.ontrack = event => {
                    console.log("verified");
                    handleTrack(event); // Call the handleTrack function with the event
                };
                peer.onicecandidate = event => {
                    console.log("ice candidate trigger");
                    if (event.candidate) {
                        socket.emit('sendIceCandidate', {
                            roomId: roomId,
                            clientId: clientId,
                            candidate: event.candidate
                        });
                    }
                }
                if (stream) {
                    await stream.getTracks().forEach(track => {
                        peer.addTrack(track, stream);
                    });
                } else {
                    console.warn('stream not found');
                }
                await connections.set(clientId, peer);
                let offer = await peer.createOffer();
                peer.setLocalDescription(offer);
                console.log('offer:', offer, clientId);
                socket.emit('sendOffer', { clientId: clientId, offer: offer, socketId: socketId });
                console.log(connections);


            });

            socket.on('createAns', async ({ clientId, offer, socketId }) => {
                console.log(offer);
                console.log('createAns emit');
                let peer = await new RTCPeerConnection({
                    iceServers: [
                        {
                            urls: [
                                'stun:stun.l.google.com:19302',
                                'stun:global.stun.twilio.com:3478'
                            ]
                        }
                    ]
                });
                peer.ontrack = async event => {
                    console.log("verified");
                    await handleTrack(event); // Call the handleTrack function with the event
                };

                peer.onicecandidate = event => {
                    console.log("ice candidate trigger");
                    if (event.candidate) {
                        socket.emit('sendIceCandidate', {
                            roomId: roomId,
                            clientId: clientId,
                            candidate: event.candidate
                        });
                    }
                }
                connections.set(socketId, peer);
                if (stream) {
                    stream.getTracks().forEach(track => {
                        peer.addTrack(track, stream);
                    });
                } else {
                    console.warn('stream not found');
                }
                console.log('offer for ans', offer);
                await peer.setRemoteDescription(offer);
                let ans = await peer.createAnswer();
                console.log(ans);
                peer.setLocalDescription(ans);

                socket.emit('sendAns', { clientId: clientId, ans: ans, socketId: socketId });
                peer.onnegotiationneeded = async event => {
                    console.log('nego nedded', event);
                    socket.emit('nego', { clientId: clientId, socketId: socketId });
                };

            });

            socket.on('setAns', async ({ clientId, ans, socketId }) => {

                console.log(connections);
                console.log('setans', ans);
                console.log('socketid', socketId);

                let peer = connections.get(clientId);

                console.log('peer', peer);
                peer.setRemoteDescription(ans);
                console.log('connected');
            });

            socket.on('nego:coffer', async ({ socketId, clientId }) => {
                let peer = connections.get(clientId);
                let offer = await peer.createOffer();
                peer.setLocalDescription(offer);
                socket.emit('nego:soffer', { offer: offer, socketId: socketId, clientId: clientId });
            });

            socket.on('nego:cans', async ({ socketId, offer, clientId }) => {
                console.log('nego:answer set');
                let peer = connections.get(socketId);
                await peer.setRemoteDescription(offer);
                let ans = await peer.createAnswer(offer);
                socket.emit('nego:sans', { socketId: socketId, ans: ans, clientId: clientId });
            });

            socket.on('nego:setlocal', ({ socketId, ans, clientId }) => {
                console.log('finallyyyyy i think it\'s connected');
                let peer = connections.get(clientId);
                peer.setRemoteDescription(ans);
            });
            socket.on('receiveIceCandidate', async ({ clientId, candidate }) => {
                console.log('Received ICE candidate:', candidate);
                let peer = connections.get(clientId);
                if (peer) {
                    await peer.addIceCandidate(candidate);
                    console.log('ICE candidate added');
                } else {
                    console.log('Peer not found');
                }
                console.log('ICE candidate added');
            });
            console.log('stream', stream);
            console.log('stream from useEffect:', stream);
        }
        connections.forEach((connection) => {
            console.log("connection", connection);
        })



    }, [stream]);

    return (
        <div>
            <p>This component has rendered {renderCount} times.</p>
            <video
                src=""
                muted
                ref={myElementRef}
                autoPlay
                id="localstream"
                style={{ backgroundColor: 'black' }}
                width="400px"
            ></video>

            {[...remoteTracks.values()].map((track, index) => {
                console.log("track", track);

                return (
                    <video
                        key={index}
                        ref={video => {
                            if (video) {
                                video.srcObject = track;
                            }
                        }}
                        playsInline
                        autoPlay
                        style={{ backgroundColor: 'black', margin: "5px" }}
                        width="400px"
                    ></video>
                );
            })}

        </div>
    );
}

export default WebRtc;

