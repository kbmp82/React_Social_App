import React, { useContext, useEffect, useRef } from "react";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";
import { useImmer } from "use-immer";
import { Link } from "react-router-dom";
import io from "socket.io-client";

export default function Chat() {
  const socket = useRef(null);
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);
  const chatInput = useRef(null);
  const chatLog = useRef(null);
  const [state, setState] = useImmer({
    inputValue: "",
    messages: [],
  });

  // watch for chat toggle
  useEffect(() => {
    if (!appState.isChatOpen) return;
    chatInput.current.focus();
    appDispatch({ type: "clearUnreadChatCount" });
  }, [appState.isChatOpen]);

  function handleInput(e) {
    const value = e.target.value;
    setState((draft) => {
      draft.inputValue = value;
    });
  }

  //watch for message from server
  useEffect(() => {
    socket.current = io("http://localhost:8080");
    socket.current.on("chatFromServer", (message) => {
      setState((draft) => {
        draft.messages.push(message);
      });
      //   //open chat if not open
      //   if (!appState.isChatOpen) {
      //     appDispatch({ type: "triggerChat", value: true });
      //   }
    });
    return () => socket.current.disconnect();
  }, []);

  //watch chat log for changes and scroll to bottom
  useEffect(() => {
    chatLog.current.scrollTop = chatLog.current.scrollHeight;
    if (state.messages.length && !appState.isChatOpen) {
      appDispatch({ type: "incrementUnreadChatCount" });
    }
  }, [state.messages]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!state.inputValue.trim()) return;
    //send message to chat server
    socket.current.emit("chatFromBrowser", {
      message: state.inputValue,
      token: appState.user.token,
    });

    setState((draft) => {
      draft.messages.push({
        message: draft.inputValue,
        username: appState.user.username,
        avatar: appState.user.avatar,
      });
      draft.inputValue = "";
    });
  }

  return (
    <div
      id="chat-wrapper"
      className={
        "chat-wrapper shadow border-top border-left border-right" +
        (appState.isChatOpen && " chat-wrapper--is-visible")
      }
    >
      <div className="chat-title-bar bg-primary">
        Chat
        <span
          onClick={() => appDispatch({ type: "triggerChat", value: false })}
          className="chat-title-bar-close"
        >
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div ref={chatLog} id="chat" className="chat-log">
        {state.messages.map((msg, index) => {
          if (msg.username == appState.user.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{msg.message}</div>
                </div>
                <img
                  alt="avatar"
                  className="chat-avatar avatar-tiny"
                  src={msg.avatar}
                />
              </div>
            );
          }
          return (
            <div key={index} className="chat-other">
              <Link to={`/profile/${msg.username}`}>
                <img alt="avatar" className="avatar-tiny" src={msg.avatar} />
              </Link>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <Link to={`/profile/${msg.username}`}>
                    <strong>{msg.username}:</strong>
                  </Link>{" "}
                  {msg.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={handleSubmit}
        id="chatForm"
        className="chat-form border-top"
      >
        <input
          ref={chatInput}
          onChange={handleInput}
          value={state.inputValue}
          type="text"
          className="chat-field"
          id="chatField"
          placeholder="Type a message…"
          autoComplete="off"
          aria-label="chat field"
        />
      </form>
    </div>
  );
}
