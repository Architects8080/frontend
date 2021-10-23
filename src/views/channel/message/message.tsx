import axios from "axios";
import React, { useEffect, useState } from "react";
import { User } from "../../profile/profileType";
import "./message.scss";

type ChatMessageProp = {
  memberId: number;
  message: string;
};

const ChatMessage = (prop: ChatMessageProp) => {
  const [user, setUser] = useState<User>();
  const [member, setMember] = useState<User>();
  useEffect(() => {
    axios
    .get(`${process.env.REACT_APP_SERVER_ADDRESS}/user/me`)
    .then(response => {
      setUser(response.data);
    });

    axios
    .get(`${process.env.REACT_APP_SERVER_ADDRESS}/user/${prop.memberId}`)
    .then(response => {
      setMember(response.data);
    })
  }, []);

  return (
    <>
      {user?.id != member?.id ? (
        <div className="other-message-wrap">
          <img className="other-message-avatar" src={member?.avatar} alt="cannot load avatar"/>
          <div className="other-message-content">
            <div className="message-username">{member?.nickname}</div>
            <div className="message-content">{prop.message}</div>
          </div>
        </div>
      ) : (
        <div className="self-message-wrap">
          <div className="self-message-content">
            <div className="message-username">{member?.nickname}</div>
            <div className="message-content">{prop.message}</div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatMessage;
