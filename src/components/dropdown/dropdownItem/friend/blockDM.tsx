import React from "react";
import { io } from "../../../../socket/socket";
import DefaultDropdownItem from "../../itemTemplate/default/item";

type props = {
  targetId: number;
};

function BlockDMItem(prop: props) {
  const handleBlockDM = () => {
    io.emit("dm/block", prop.targetId); //TODO
  };

  return (
    <DefaultDropdownItem
      title="DM 차단하기 (Block)"
      color="red"
      callback={handleBlockDM}
    />
  );
}

export default BlockDMItem;
