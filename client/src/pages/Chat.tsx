import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoChatbubbleEllipsesSharp, IoSend } from "react-icons/io5";
import { FaHourglassEnd } from "react-icons/fa";

import { AuthContext } from "../contexts/authContext";
import { SocketContext } from "../contexts/socketContext";
import {
  useGetConversations,
  useGetMessages,
  useSendMessage,
} from "../hooks/useMessage";
import { ConversationModel, MessageModel } from "../models/MessageModel";
import { getRelativeTime } from "../utilities/getRelativeTime";

import Spinner from "../components/Spinner";

interface SelectedConversation {
  pid: string;
  title: string;
  price: number;
  images: string[];
  uid: string;
  username: string;
  avatar: string;
}

const Chat = () => {
  const location = useLocation();
  const { state: auth } = useContext(AuthContext);
  const { socket, online } = useContext(SocketContext);

  const [selected, setSelected] = useState<SelectedConversation>({
    pid: "",
    title: "",
    price: 0,
    images: [],
    uid: "",
    username: "",
    avatar: "",
  });
  const [conversations, setConversations] = useState<ConversationModel[]>([]);
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [text, setText] = useState("");

  const {
    getConversations,
    loading: conversationsLoading,
    error: conversationsError,
  } = useGetConversations();
  const {
    getMessages,
    loading: messagesLoading,
    error: messagesError,
  } = useGetMessages();
  const {
    sendMessage,
    loading: sendLoading,
    error: sendError,
  } = useSendMessage();

  useEffect(() => {
    setConversations([]);

    // get all conversations

    const getAllConversations = async () => {
      const conversations = await getConversations();

      if (conversations) setConversations(conversations);
      else setConversations([]);
    };

    getAllConversations();

    // get all messages if directed from listing

    const getAllMessages = async (selected: SelectedConversation) => {
      setSelected(selected);

      const messages = await getMessages({
        pid: selected.pid,
        uid: selected.uid,
      });

      if (messages) setMessages(messages);
      else setMessages([]);
    };

    if (location.state)
      getAllMessages({
        pid: location.state.pid,
        title: location.state.title,
        price: location.state.price,
        images: location.state.images,
        uid: location.state.uid,
        username: location.state.username,
        avatar: location.state.avatar,
      });
  }, []);

  useEffect(() => {
    const container = document.querySelector(".messages-middle");

    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, conversationsLoading, messagesLoading]);

  // socket.io useEffect

  useEffect(() => {
    if (socket) {
      socket.on("message", ({ pid, message }) => {
        if (selected.pid === pid) {
          setMessages([...messages, message]);
        }
      });

      return () => {
        socket.off("message");
      };
    }
  }, [socket, messages, conversationsLoading, messagesLoading]);

  if (conversationsLoading) {
    return <Spinner />;
  }

  const handleSelect = async (selected: SelectedConversation) => {
    setSelected(selected);

    const messages = await getMessages({
      pid: selected.pid,
      uid: selected.uid,
    });

    if (messages) setMessages(messages);
    else setMessages([]);
  };

  const handleSend = async () => {
    if (!text.trim()) return;

    const message = await sendMessage({
      pid: selected.pid,
      uid: selected.uid,
      text,
    });

    if (message) {
      setMessages((prev) => [...prev, message]);
      setText("");
    }
  };

  return (
    <div className="chat">
      <h1><IoChatbubbleEllipsesSharp />Chat</h1>

      <div className="chat-grid">
        <div className="chat-conversations">
          <h2>Conversations</h2>

          <div className="conversation-cards">
            {conversations.length > 0
              ? conversations.map((conversation) => (
                  <div
                    key={conversation.cid}
                    className="conversation-card"
                    onClick={() =>
                      handleSelect({
                        pid: conversation.pid,
                        title: conversation.title,
                        price: conversation.price,
                        images: conversation.images,
                        uid: conversation.uid,
                        username: conversation.username,
                        avatar: conversation.avatar,
                      })
                    }
                    style={{
                      border:
                        conversation.pid === selected.pid
                          ? "1px solid grey"
                          : "1px solid aliceblue",
                    }}
                  >
                    <div className="conversation-receiver">
                      <div
                        className="receiver-avatar"
                        style={{
                          backgroundImage: `url(${conversation.avatar})`,
                        }}
                      >
                        <div
                          className="online-status"
                          style={{
                            background: online.includes(conversation.uid)
                              ? "green"
                              : "red",
                          }}
                        ></div>
                      </div>
                      <h3>{conversation.username}</h3>
                    </div>
                    <div className="conversation-listing">
                      <p>
                        <strong>{conversation.title}</strong>
                      </p>
                      <p>S$ {Number(conversation.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))
              : !conversationsLoading && <p>No conversations available</p>}

            {conversationsError && (
              <p className="error-text">
                Conversations Error: {conversationsError}
              </p>
            )}
          </div>
        </div>

        <div className="chat-messages">
          <div className="messages-top">
            {!selected.pid && <h2>Messages</h2>}
            {selected.pid && (
              <div className="message-group">
                <div
                  className="message-image"
                  style={{
                    backgroundImage: `url(${selected.images.find(
                      (image) => image !== "none"
                    )})`,
                  }}
                ></div>
                <p className="message-title">
                  <strong>{selected.title}</strong>
                  <br />
                  S$ {Number(selected.price).toFixed(2)}
                  <br />
                  <span className="message-username">Chatting with </span>
                  <Link to={`/profile/${selected.uid}`}>
                    <strong className="message-username">
                      {selected.username}
                    </strong>
                  </Link>
                </p>
              </div>
            )}
          </div>

          <div className="messages-middle">
            {messagesLoading ? (
              <p>Loading...</p>
            ) : messages.length > 0 ? (
              messages.map((message) => (
                <div key={message.mid}>
                  <div
                    className={`message-text ${
                      auth.user &&
                      auth.user.uid === message.sender &&
                      "message-right"
                    }`}
                  >
                    <p>{message.text}</p>
                  </div>
                  <p
                    className={`message-created ${
                      auth.user &&
                      auth.user.uid === message.sender &&
                      "message-right"
                    }`}
                  >
                    {getRelativeTime(message.created)}
                  </p>
                </div>
              ))
            ) : (
              <p>No messages available</p>
            )}

            {messagesError && (
              <p className="error-text">Messages Error: {messagesError}</p>
            )}
          </div>

          {selected.pid && !messagesLoading && (
            <div className="messages-bottom">
              <input
                type="text"
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoComplete="off"
                required
                disabled={sendLoading}
              />
              <button
                onClick={handleSend}
                style={{
                  background: sendLoading ? "grey" : "orange",
                }}
                disabled={sendLoading}
              >
                {sendLoading ? (
                  <FaHourglassEnd size={25} />
                ) : (
                  <IoSend size={25} />
                )}
              </button>
            </div>
          )}

          {sendError && <p className="error-text">Send Error: {sendError}</p>}
        </div>
      </div>
    </div>
  );
};

export default Chat;
