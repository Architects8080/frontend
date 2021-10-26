import React from "react";
import AddFriendItem from "../dropdownItem/channel/addFriend";
import BanUserItem from "../dropdownItem/channel/admin/ban";
import MuteUserItem from "../dropdownItem/channel/admin/mute";
import GrantAdminItem from "../dropdownItem/channel/owner/grantAdmin";
import RevokeAdminItem from "../dropdownItem/channel/owner/revokeAdmin";
import InviteGameItem from "../dropdownItem/inviteGame";
import ObserveGameItem from "../dropdownItem/observeGame";
import ViewProfileItem from "../dropdownItem/viewProfile";
import "./dropdownList.scss";
import { DropdownListType } from "./dropdownListType";

const ChannelOwnerDropdownList = (prop: DropdownListType) => {
  const info = prop.dropdownListInfo;
  const position = { top: prop.anchorPoint.y, left: prop.anchorPoint.x };
  console.log(`result : OWNER`)

  return (
    <div className="dropdown-list-wrap" style={position}>
      <ViewProfileItem targetId={info.targetId} />
      {info.targetId !== info.userId ?
        <React.Fragment>
          {!info.isFriend ? <AddFriendItem targetId={info.targetId} /> : ""}
          {info.isPlaying ? (
            <ObserveGameItem targetId={info.targetId}/>
          ) : (
            <InviteGameItem
              targetId={info.targetId}
              modalHandler={prop.modalHandler}
            />
          )}

          {/* showing below all dropdown menu because owner's permission is best */}
          {!info.isAdmin ?
              <GrantAdminItem channelId={info.channelId} targetId={info.targetId} />
             :
              <RevokeAdminItem channelId={info.channelId} targetId={info.targetId} />
          }

          {info.isBannable ?
            <BanUserItem channelId={info.channelId} targetId={info.targetId} />
          : ""}

          {info.isMuteAble ?
            <MuteUserItem channelId={info.channelId} targetId={info.targetId} />
          : ""}
        </React.Fragment>
      : ""}
    </div>
  );
}

export default ChannelOwnerDropdownList;
