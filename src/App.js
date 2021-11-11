import "./styles.css";
import React, { useState, useRef } from "react";
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  useCollection,
  useCollectionData
} from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyDimU1Ww9Ddb2OGKcHJECjNWZt41jMtfWw",
  authDomain: "chatreact-ca281.firebaseapp.com",
  projectId: "chatreact-ca281",
  storageBucket: "chatreact-ca281.appspot.com",
  messagingSenderId: "342527518600",
  appId: "1:342527518600:web:d6f9f4d383fd38bf8a3c3d"
});
const auth = firebase.default.auth();
const firestore = firebase.firestore();

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopUp(provider);
  };
  return (
    <button className="sign-in" onClick={signInWithGoogle}>
      Sign in with google
    </button>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messageRef = firestore.collection("messages");
  const query = messageRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit" disabled={!formValue}>
          send
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img
        src={
          photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
        }
        alt="no user"
      />
      <p>{text}</p>
    </div>
  );
}

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        test
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

export default App;
