import "./App.css";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useState,useRef,useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyCDNxTtQZwFRQ54Fz9SXNOxVwkH0SxzIiw",
    authDomain: "chat-98376.firebaseapp.com",
    projectId: "chat-98376",
    storageBucket: "chat-98376.appspot.com",
    messagingSenderId: "845769772031",
    appId: "1:845769772031:web:6d1b899f47bf7922e375ca",
    measurementId: "G-0E7J2KDDWB",
  });
}else{
  firebase.app()
}


const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
      <SingOut /></header>
      <section>{user ? <ChatRoom /> : <SingIn />}</section>
    </div>
  );

  function SingIn() {

    const singInWithGoogle=()=>{
      var provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
    }

    return (<button onClick={singInWithGoogle}>Sing in with Google</button>)
  }


  function ChatRoom() {

    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    const messagesRef= firestore.collection('messages');
    const query=messagesRef.orderBy('createdAt').limit(25);

    const [messages] = useCollectionData(query,{idField:'id'});

    const [formValue, setFormValue] = useState('');
    useEffect(() => {
      scrollToBottom()
    }, [messages]);



    const sendMessage = async(e)=>{
      e.preventDefault();
      const {uid,photoURL}=auth.currentUser;
      await messagesRef.add({
        text:formValue,
        createdAt:firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
      })

      setFormValue('');
    }
    const dummy=useRef()
    return (
      <>
      <div>
        {messages && messages.map(msg =><ChatMessage key={msg.id} message={msg} />)}
      <div ref={messagesEndRef}></div>
      </div>
      <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e)=> setFormValue(e.target.value)}/>
      <button type="sumit">Send</button>

      </form>
      </>
    )
      
  }
}

function SingOut() {


  return auth.currentUser && (
    <button onClick={()=>auth.signOut()}>Sing out</button>
    
  )

}

function ChatMessage(props){
  const{text,uid,photoURL} = props.message;

  const messageClass=uid === auth.currentUser.uid ? 'sent' : 'received'

  return(
  <div className={`message ${messageClass}`}>
  <img src={photoURL} />
  <p>{text}</p>
  </div>
  )
}

export default App;
