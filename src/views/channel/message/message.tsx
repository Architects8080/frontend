import axios from "axios";
import React, { useEffect, useState } from "react";
import { User } from "../../profile/profileType";
import "./message.scss";

type ChatMessageProp = {
  userId: number;
  sender: {
    id: number,
    nickname: string,
    avatar: string,
  }
  message: string;
};

const ChatMessage = (prop: ChatMessageProp) => {
  const [user, setUser] = useState<User>();

  return (
    <>
      {prop.userId != prop.sender?.id ? (
        <div className="other-message-wrap">
          <img className="other-message-avatar" src={prop.sender?.avatar} alt="cannot load avatar"/>
          <div className="other-message-content">
            <div className="message-username">{prop.sender?.nickname}</div>
            <div className="message-content">{prop.message}</div>
          </div>
        </div>
      ) : (
        <div className="self-message-wrap">
          <div className="self-message-content">
            <div className="message-username">{prop.sender?.nickname}</div>
            <div className="message-content">{prop.message}</div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatMessage;
