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
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const getMedia = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          const videoElm = myRef.current;
          if (videoElm) {
            console.log("success: getUserMedia()");

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

  const handleTheirIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTheirId(e.target.value);
  };
  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  return (
    <div className="App">
      <div id="companion">
        <span>companion</span>
        <div>
          <input
            type="text"
            value={theirId}
            onChange={handleTheirIdChange}
            placeholder="TheirId"
          />
          <button onClick={handleCall}>接続</button>
        </div>
        <div>
          <video
            className="video"
            ref={theirRef}
            width="400px"
            autoPlay
            muted
            playsInline
          />
        </div>
      </div>
      <div id="me">
        <span>me</span>
        <div>
          <video
            className="video"
            ref={myRef}
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
