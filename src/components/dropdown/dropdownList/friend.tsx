import BlockDMItem from "../dropdownItem/friend/blockDM";
import ObserveGameItem from "../dropdownItem/observeGame";
import InviteGameItem from "../dropdownItem/inviteGame";
import ViewProfileItem from "../dropdownItem/viewProfile";
import "./dropdownList.scss";
import DeleteFriendItem from "../dropdownItem/friend/delete";
import React from "react";
import { DropdownListType } from "./dropdownListType";

const FriendDropdownList = (prop: DropdownListType) => {
  const info = prop.dropdownListInfo;
  const position = { top: prop.anchorPoint.y, left: prop.anchorPoint.x };

  return (
    <div className="dropdown-list-wrap" style={position}>
      <ViewProfileItem targetId={info.targetId} />
        {info.isPlaying
          ? <ObserveGameItem targetId={info.targetId} />
          : <InviteGameItem
              targetId={info.targetId}
              modalHandler={prop.modalHandler}
          />
        }
      <BlockDMItem targetId={info.targetId} />
      <DeleteFriendItem targetId={info.targetId} />
    </div>
  );
}

export default FriendDropdownList;
