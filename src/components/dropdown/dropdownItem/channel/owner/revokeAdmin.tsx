import axios from "axios";
import React from "react";
import { io } from "../../../../../socket/socket";
import DefaultDropdownItem from "../../../itemTemplate/default/item";

type ItemProps = {
  targetId: number;
  channelId: number;
};

const RevokeAdminItem = (prop: ItemProps) => {
  const handleRevokeAdmin = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_ADDRESS}/channel/${prop.channelId}/admin/${prop.targetId}`);
    } catch (error) {
      
    }
  };

  return (
    <DefaultDropdownItem
      title="어드민 권한 제거하기"
      color="red"
      callback={handleRevokeAdmin}
    />
  );
}

export default RevokeAdminItem;
