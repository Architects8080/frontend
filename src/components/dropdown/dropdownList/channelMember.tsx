import React from "react";
import AddFriendItem from "../dropdownItem/channel/addFriend";
import InviteGameItem from "../dropdownItem/inviteGame";
import ObserveGameItem from "../dropdownItem/observeGame";
import ViewProfileItem from "../dropdownItem/viewProfile";
import "./dropdownList.scss";
import { DropdownListType } from "./dropdownListType";

const ChannelMemberDropdownList = (prop: DropdownListType) => {
  const info = prop.dropdownListInfo;
  const position = { top: prop.anchorPoint.y, left: prop.anchorPoint.x };
  {
    console.log("channel default", prop);
  }
  console.log(`result : MEMBER`)

  return (
    <div className="dropdown-list-wrap" style={position}>
      <ViewProfileItem targetId={info.targetId} />
      {info.targetId !== info.userId ? 
        <React.Fragment>
          {!info.isFriend ? <AddFriendItem targetId={info.targetId} /> : ""}
          {info.isPlaying ? (
            <ObserveGameItem targetId={info.targetId} />
          ) : (
            <InviteGameItem
              targetId={info.targetId}
              modalHandler={prop.modalHandler}
            />
          )}
        </React.Fragment>
      : ""}
    </div>
  );
}

export default ChannelMemberDropdownList;
