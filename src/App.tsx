import "./App.css";
import Peer, { MediaConnection } from "skyway-js";
import { useState, useRef, useEffect } from "react";

const peer = new Peer({
  key: process.env.REACT_APP_SKY_WAY_KEY as string,
  debug: 3,
});
let localStream: MediaStream;

function App() {
  const myRef = useRef<HTMLVideoElement>(null);
  const theirRef = useRef<HTMLVideoElement>(null);
  const [peerId, setPeerId] = useState<string>("");
  const [theirId, setTheirId] = useState<string>("");

  useEffect(() => {
    const getMedia = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          const videoElm = myRef.current;
          if (videoElm) {
            videoElm.srcObject = stream;
            videoElm.play();
          }
          localStream = stream;
        })
        .catch((error) => {
          console.error("mediaDevice.getUserMedia() error:", error);
          return;
        });
    };
    getMedia();

    peer.on("open", () => {
      console.log("open");
      setPeerId(peer.id);
    });
  }, []);

  const handleCall = () => {
    const mediaConnection = peer.call(theirId, localStream);
    setEventListener(mediaConnection);
  };

  const setEventListener = (mediaConnection: MediaConnection) => {
    mediaConnection.on("stream", (stream: MediaStream) => {
      const videoElm = theirRef.current;
      if (videoElm) {
        videoElm.srcObject = stream;
        videoElm.play();
      }
    });
  };

  peer.on("call", (mediaConnection) => {
    mediaConnection.answer(localStream);
    setEventListener(mediaConnection);
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTheirId(e.target.value);
  };

  return (
    <div className="App">
      <video ref={myRef} width="400px" autoPlay muted playsInline></video>
      <p>{peerId}</p>
      <textarea value={theirId} onChange={handleChange}></textarea>
      <button onClick={handleCall}>発信</button>
      <video ref={theirRef} width="400px" autoPlay muted playsInline></video>
    </div>
  );
}

export default App;
