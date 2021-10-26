import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { io } from "../../socket/socket";
import { User } from "../../views/profile/profileType";
import { ContextMenuInfo, DMUser, MemberRole, SidebarProperty, Status } from "./sidebarType";
import UserItem from "./userTemplate/user";

type SidebarItemProps = {
  contextMenuHandler: any;

  itemType: SidebarProperty;
  // itemInfo: UserItemProps;
  userId: number;

  targetUser: User | DMUser; //to with status?
  targetId: number;
  targetStatus: number;
  // gameId?: number; //gameId or null
  channelId?: number; //channelId or null
  userRole?: MemberRole; //Channel
  targetRole?: MemberRole; //Channel
};

const menuInit = (menu: ContextMenuInfo) => {
  menu.channelId = 0;
  menu.isAdmin = false;
  menu.isBannable = false;
  menu.isFriend = false;
  menu.isPlaying = false;
  menu.isMuteAble = false;
  menu.targetId = 0;
  menu.userId = 0;
  menu.myRole = MemberRole.MEMBER;
}

const SidebarItem = (prop: SidebarItemProps) => {
  var menuInfo: ContextMenuInfo = {
    channelId: 0,
    isAdmin: false,
    isBannable: false,
    isFriend: false,
    isPlaying: false,
    isMuteAble: false,
    targetId: 0,
    userId: 0,
  }

  const [friendList, setFriendList] = useState<User[]>([]);
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/friend`)
    .then(response => {setFriendList(response.data)})
    .catch(() => {})
  }, []);

  const isFriend = () => {
    return (friendList.find((friend: User) => {
      return friend.id == prop.targetId;
    }) != undefined);
  }

  const handleDropdown = async (e: React.MouseEvent) => {
    menuInit(menuInfo);

    if (e.type === "contextmenu") {
      menuInfo.userId = prop.userId;
      menuInfo.targetId = prop.targetId;
      menuInfo.isPlaying = prop.targetStatus == Status.PLAYING;

      if (prop.itemType === SidebarProperty.CHAT_MEMBER_LIST && prop.channelId) {
        menuInfo.myRole = prop.userRole;
        menuInfo.channelId = prop.channelId;
        menuInfo.isFriend = isFriend();

        if (prop.userRole === MemberRole.ADMIN && prop.targetRole === MemberRole.MEMBER) {
          menuInfo.isBannable = true;
          menuInfo.isMuteAble = true;
        }

        if (prop.userRole === MemberRole.OWNER) {
          menuInfo.isBannable = true;
          menuInfo.isMuteAble = true;
          if (prop.targetRole === MemberRole.ADMIN) {
            menuInfo.isAdmin = true;
          }
        }
      }

      console.log(`menuInfo : `, menuInfo);
      prop.contextMenuHandler(e, menuInfo);
    }
  };

  return (
    <>
      <div onContextMenu={handleDropdown}>
        <UserItem {...prop.targetUser} />
      </div>
    </>
  );
}

export default SidebarItem;
