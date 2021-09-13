import "./App.css";
import Peer, { MediaConnection } from "skyway-js";
import { useState, useRef, useEffect } from "react";

const peer = new Peer({
  key: process.env.REACT_APP_SKY_WAY_KEY as string,
  debug: 3,
});

function App() {
  const [localStream, setLocalStream] = useState<MediaStream>();

  const meRef = useRef<HTMLVideoElement>(null);
  const companionRef = useRef<HTMLVideoElement>(null);
  const [userName, setUserName] = useState<string>("");
  const [peerId, setPeerId] = useState<string>("");
  const [companionId, setCompanionId] = useState<string>("");

  const getMedia = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        const videoElm = meRef.current as HTMLVideoElement;
        videoElm.srcObject = stream;
        videoElm.play();
        setLocalStream(stream);
      })
      .catch((error) => {
        console.error("mediaDevice.getUserMedia() error:", error);
        return;
      });
  };

  const setEventListener = (mediaConnection: MediaConnection) => {
    mediaConnection.on("stream", (stream: MediaStream) => {
      const videoElm = companionRef.current as HTMLVideoElement;
      videoElm.srcObject = stream;
      videoElm.play();
    });
  };

  const handleCompanionIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanionId(e.target.value);
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const handleCall = () => {
    const mediaConnection = peer.call(companionId, localStream);
    setEventListener(mediaConnection);
  };

  useEffect(() => {
    getMedia();

    peer.on("open", () => {
      console.log("open");
      setPeerId(peer.id);
    });
  
  }, []);
  peer.on("call", (mediaConnection) => {
    mediaConnection.answer(localStream);
    setEventListener(mediaConnection);
  });

  return (
    <div className="App">
      <div id="companion">
        <span>Companion</span>
        <div>
          <video
            className="video"
            ref={companionRef}
            width="400px"
            autoPlay
            playsInline
          />
        </div>
        <div>
          <input
            type="text"
            value={companionId}
            onChange={handleCompanionIdChange}
            placeholder="CompanionId"
          />
          <button onClick={handleCall}>接続</button>
        </div>
      </div>
      <div id="me">
        <span>Me</span>
        <div>
          <video
            className="video"
            ref={meRef}
            width="400px"
            autoPlay
            muted
            playsInline
          />
        </div>
        <div>
          <input
            type="text"
            value={userName}
            onChange={handleUserNameChange}
            placeholder="UserName"
          />
          <p>{peerId}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
