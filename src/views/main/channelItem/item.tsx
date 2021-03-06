import axios from "axios";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import EnterPasswordModal from "../../../components/modal/channel/join/enterPasswordModal";
import ModalHandler from "../../../components/modal/modalhandler";
import snackbar from "../../../components/snackbar/snackbar";
import { ioChannel } from "../../../socket/socket";
import "./item.scss";

export type ChannelItemProps = {
  id: number,
  title: string,
  memberCount: number,
  type: ChannelType,
}

enum ChannelType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PROTECTED = 'protected',
}

const ChannelItem = ({channel} : {channel:ChannelItemProps}) => {
  const history = useHistory();
  const modalHandler = ModalHandler();

  const handleOnClick = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/channel/me`);
      if (channel.type === ChannelType.PROTECTED && 
        !response.data.find((element: any) => element.id === channel.id)) {
        modalHandler.handleModalOpen("enterPassword");
      }
      else {
        try {
          const access = await axios.post(`${process.env.REACT_APP_SERVER_ADDRESS}/channel/${channel.id}/member`);
        } catch (error: any) {
          if (error.response.status != 409) {
            if (error.response.status == 403)
              snackbar.error("채널에 접속할 수 없습니다.");
            else
              snackbar.error("알 수 없는 오류가 발생했습니다.")
            return
          }
        }
        history.push(`/channel/${channel.id}`);
      }
    } catch (error) {
      
    }


  };

  const handleModalClose = () => {
    modalHandler.handleModalClose("enterPassword");
  };

  return (
    <>
      <div className="channel-item" onClick={handleOnClick}>
        <div className="channel-header">
          <div className="channel-title">[{channel.id}] {channel.title}</div>
          { channel.type === ChannelType.PRIVATE ? 
            <img className="channel-locked" alt="channel-locked" src="/icons/chat/private.svg"/> : ""}
          { channel.type === ChannelType.PROTECTED ? 
            <img className="channel-locked" alt="channel-locked" src="/icons/chat/protected.svg"/> : ""}
        </div>
        <div className="channel-member-count">{channel.memberCount}명 참여중</div>
      </div>
      <EnterPasswordModal open={modalHandler.isModalOpen.enterPassword} close={handleModalClose} channelId={channel.id}/>
    </>
  );
}

export default ChannelItem;
