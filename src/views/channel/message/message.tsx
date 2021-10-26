import React, { useState } from "react";
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
  const anonymousAvatar = "https://w7.pngwing.com/pngs/565/454/png-transparent-user-computer-icons-anonymity-head-miscellaneous-face-service.png";
  const anonymousNickname = "알 수 없음";

  return (
    <>
      {prop.userId != prop.sender?.id ? (
        <div className="other-message-wrap">
          <img className="other-message-avatar" src={prop.sender?.avatar == null ? anonymousAvatar : prop.sender?.avatar} alt="cannot load avatar"/>
          <div className="other-message-content">
            <div className="message-username">{prop.sender?.nickname == null ? anonymousNickname : prop.sender?.nickname}</div>
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
