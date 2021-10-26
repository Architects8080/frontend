import axios from "axios";
import React from "react";
import { io } from "../../../../../socket/socket";
import DefaultDropdownItem from "../../../itemTemplate/default/item";

type ItemProps = {
  targetId: number;
  channelId: number;
};

const MuteUserItem = (prop: ItemProps) =>{
  const handleMuteUser = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_SERVER_ADDRESS}/channel/${prop.channelId}/mute/${prop.targetId}`);
    } catch (error) {
      
    }
  };

  return (
    <DefaultDropdownItem
      title="이 방에서 차단하기 (Mute)"
      color="red"
      callback={handleMuteUser}
    />
  );
}

export default MuteUserItem;
