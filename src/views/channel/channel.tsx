import React from "react";
import { useEffect } from "react";
import { useState, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import Header from "../../components/header/header";
import ModalHandler from "../../components/modal/modalhandler";
import ChatMessage from "./message/message";
import { ioChannel } from "../../socket/socket";
import "./channel.scss";
import GameModalListener from "../../components/modal/gameModalListener";
import axios from "axios";
import ChannelSidebar from "../../components/sidebar/channelSidebar";
import snackbar from "../../components/snackbar/snackbar";

type ChannelMessageDto = {
  channelId: number;
  message: string;
};

// 서버로부터 받는 메시지 형태
type ChannelMessage = {
  id: number,
  channelId: number;
  message: string;
  sender: {
    id: number,
    nickname: string,
    avatar: string,
  }
}

const AlwaysScrollToBottom = () => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => elementRef.current?.scrollIntoView());
  return <div ref={elementRef} />;
};

const Channel = () => {
  const history = useHistory();
  const modalHandler = ModalHandler();
  const [messageList, setMessageList] = useState<ChannelMessage[]>([]);

  const [userId, setUserId] = useState(0);
  const [isMute, setIsMute] = useState(false);
  const [muteExpired, setMuteExpired] = useState("");
  const [message, setMessage] = useState('');
  const { channelId } : any = useParams();

  const setDateFormat = (expired: Date) => {
    console.log(expired);
    console.log(typeof(expired));
    let year = expired.getFullYear();
    let month = ('0' + (expired.getMonth() + 1)).slice(-2);
    let day = ('0' + expired.getDate()).slice(-2);
    let hours = ('0' + expired.getHours()).slice(-2); 
    let minutes = ('0' + expired.getMinutes()).slice(-2);
    let seconds = ('0' + expired.getSeconds()).slice(-2);

    let dateString = year + '-' + month  + '-' + day;
    let timeString = hours + ':' + minutes  + ':' + seconds;

    setMuteExpired(dateString + " " + timeString);
  }

  const channelInit = async () => {
    try {
      const user = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/user/me`);
      setUserId(user.data.id)
    } catch (error) {
      
    }

    try {
      await axios.post(`${process.env.REACT_APP_SERVER_ADDRESS}/channel/${channelId}/member`);
    } catch (error: any) {
      console.log(error);
      if (error.response.data.statusCode !== 409) { //Conflict Exception : is already join channel
        history.push(`/main`);
        window.alert("비정상적인 접근입니다");
      }
    }
    try {
      const messageList = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/channel/${channelId}/message`);
      console.log(messageList);
      setMessageList(messageList.data);
      ioChannel.emit('subscribeChannel', channelId);
    } catch (error: any) {
     
    }
  }

  useEffect(() => {
    channelInit();

    ioChannel.on('messageToClient', (message: ChannelMessage) => {
      setMessageList(messageList => [...messageList, message]);
    });

    ioChannel.on('muteMember', (channelId: number, expired: Date) => {
      snackbar.error("메시지를 보낼 수 없습니다.");
      setIsMute(true);
      setDateFormat(new Date(expired));
    });

    ioChannel.on('unmuteMember', (channelId: number) => {
      setIsMute(false);
    });
  }, []);

  const sendMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== 'Enter' || message === '')
			return;
		const newMessageSend: ChannelMessageDto = {
      channelId: Number(channelId),
      message: message,
		};
		ioChannel.emit('messageToServer', newMessageSend);
		setMessage('');
	}

  const leaveChannel = async () => {
    ioChannel.emit(`unsubscribeChannel`, (channelId));
    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_ADDRESS}/channel/${channelId}/member`);
    } catch (error) {
      
    }
    history.push(`/main`);
  }

  return (
    <>
      <Header isLoggedIn={true} />
      <div className="page">
        <ChannelSidebar
          channelId={channelId}
          modalHandler={modalHandler}
        />
        <div className="channel-wrap">
          <div className="channel-message-list-wrap">
            <div className="channel-message-list">
              {messageList.length != 0 ? messageList.map(message => (
                <ChatMessage key={message.id} userId={userId} sender={message.sender} message={message.message}/>
              )): ""}
              <AlwaysScrollToBottom/>
            </div>
            <div className="channel-user-input">
              <input 
                disabled={isMute}
                className="input-field"
                placeholder={isMute ? `${muteExpired} 이후에 Mute가 풀립니다.` : "내용을 입력하세요"}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyPress={sendMessage}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className="button-channel-exit"
        onClick={leaveChannel}
      >
        채팅방 나가기
      </div>
      <GameModalListener modalHandler={modalHandler}/>
    </>
  );
}

export default Channel;
