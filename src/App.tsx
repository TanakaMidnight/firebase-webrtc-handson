import "./App.css";
import Peer, { MediaConnection } from "skyway-js";
import { useState, useRef, useEffect } from "react";
import {
  onSnapshot,
  collection,
  addDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { firebaseDB } from "./Firebase";

const peer = new Peer({
  key: process.env.REACT_APP_SKY_WAY_KEY as string,
  debug: 3,
});

interface User {
  id: string;
  name: string;
  peerId: string;
}

let localStream: MediaStream;

function App() {
  const meRef = useRef<HTMLVideoElement>(null);
  const companionRef = useRef<HTMLVideoElement>(null);
  const [userName, setUserName] = useState<string>("鈴木一郎");
  const [peerId, setPeerId] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const getMedia = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        const videoElm = meRef.current as HTMLVideoElement;
        videoElm.srcObject = stream;
        videoElm.play();
        localStream = stream;
      })
      .catch((error) => {
        console.error("mediaDevice.getUserMedia() error:", error);
        alert(
          "WebComの接続に失敗しました。WebCamの接続を確認するか、サイトでの利用を「許可」にしてください。"
        );
        return;
      });
  };

  const setEventListener = (mediaConnection: MediaConnection) => {
    mediaConnection.on("stream", (stream: MediaStream) => {
      console.debug("mediaConnection.on stream");
      const videoElm = companionRef.current as HTMLVideoElement;
      videoElm.srcObject = stream;
      videoElm.play();
    });
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const handleSubscription = () => {
    addDoc(collection(firebaseDB, "users"), { name: userName, peerId: peerId });
  };

  const handleCall = (peerId: string) => {
    const mediaConnection = peer.call(peerId, localStream);
    setEventListener(mediaConnection);
  };

  const handleDelete = (userId: string) => {
    deleteDoc(doc(firebaseDB, "users", userId));
  };

  useEffect(() => {
    // WebCam,Mic接続
    getMedia();

    // 自WebRTC接続
    peer.on("open", () => {
      setPeerId(peer.id);
    });

    //Firesotre 購読
    onSnapshot(collection(firebaseDB, "users"), (querySnapshot) => {
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          name: doc.data().name,
          peerId: doc.data().peerId,
        });
      });
      setUsers(users);
      console.debug("Current users: ", users);
    });
  }, []);

  // 着信処理
  peer.on("call", (mediaConnection) => {
    mediaConnection.answer(localStream);
    setEventListener(mediaConnection);
  });

  return (
    <div className="App">
      <div id="companion">
        <span>相手</span>

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
          <table>
            <thead>
              <tr>
                <td>相手の名前</td>
                <td>操作</td>
              </tr>
            </thead>
            <tbody>
              {users.map((v) => {
                return (
                  <tr key={v.id}>
                    <td>
                      {v.name}({v.peerId})
                    </td>
                    <td>
                      <button onClick={() => handleCall(v.peerId)}>接続</button>
                      <button onClick={() => handleDelete(v.id)}>削除</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div id="me">
        <span>あなた</span>
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
          名前:
          <input
            type="text"
            value={userName}
            onChange={handleUserNameChange}
            placeholder="UserName"
          />
          <button onClick={handleSubscription}>登録</button>
          <p>自ID:&nbsp{peerId}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
