import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const connections = new Map();

function WebRtc({ roomId, userId }) {

    const myElementRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [remoteTracks, setRemoteTracks] = useState(new Map());


    useEffect(() => {

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            myElementRef.current.srcObject = stream;
            setStream(stream);

        });
    }, []);

    const handleTrack = async event => {

        await setRemoteTracks(prevRemoteTracks => new Map(prevRemoteTracks).set(event.streams[0].id, event.streams[0]));

    };


    useEffect(() => {

        if (stream) {

            const socket = io.connect('https://video-call-1wu3.onrender.com');

            socket.on('newUser', () => {

                socket.emit('joinUser', {
                    roomId: roomId,
                    userId: userId
                });

            });

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
                    handleTrack(event);
                };

                peer.onicecandidate = event => {

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

                socket.emit('sendOffer', {
                    clientId: clientId,
                    offer: offer,
                    socketId: socketId
                });


            });

            socket.on('createAns', async ({ clientId, offer, socketId }) => {

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
                    await handleTrack(event);
                };

                peer.onicecandidate = event => {

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

                await peer.setRemoteDescription(offer);
                let ans = await peer.createAnswer();

                await peer.setLocalDescription(ans);

                socket.emit('sendAns', {
                    clientId: clientId,
                    ans: ans,
                    socketId: socketId
                });

                peer.onnegotiationneeded = async event => {

                    socket.emit('nego', {
                        clientId: clientId,
                        socketId: socketId
                    });
                };

            });

            socket.on('setAns', async ({ clientId, ans, socketId }) => {

                let peer = connections.get(clientId);
                await peer.setRemoteDescription(ans);

            });

            socket.on('nego:coffer', async ({ socketId, clientId }) => {
                let peer = connections.get(clientId);
                let offer = await peer.createOffer();
                await peer.setLocalDescription(offer);
                socket.emit('nego:soffer', {
                    offer: offer,
                    socketId: socketId,
                    clientId: clientId
                });
            });

            socket.on('nego:cans', async ({ socketId, offer, clientId }) => {

                let peer = connections.get(socketId);
                await peer.setRemoteDescription(offer);
                let ans = await peer.createAnswer(offer);
                socket.emit('nego:sans', {
                    socketId: socketId,
                    ans: ans,
                    clientId: clientId
                });
            });

            socket.on('nego:setlocal', async ({ socketId, ans, clientId }) => {

                let peer = connections.get(clientId);
                await peer.setRemoteDescription(ans);
            });

            socket.on('receiveIceCandidate', async ({ clientId, candidate }) => {

                let peer = connections.get(clientId);

                if (peer) {

                    await peer.addIceCandidate(candidate);

                } else {
                    console.log('Peer not found');
                }

            });

        }

    }, [stream]);

    return (
        <div>

            <video
                src=""
                muted
                ref={myElementRef}
                autoPlay
                id="localstream"
                style={{ backgroundColor: 'black' }}
                width="200px"
                height="200px"
            ></video>

            {[...remoteTracks.values()].map((track, index) => {
            
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
                        width="200px"
                        height="200px"
                    ></video>
                );
            })}

        </div>
    );
}

export default WebRtc;
