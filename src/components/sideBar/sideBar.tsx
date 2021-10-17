import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ioChannel, ioCommunity } from "../../socket/socket";
import DirectMessage from "../directMessage/directMessage";
import ChatroomAdminDropdownList from "../dropdown/dropdownList/chatroomAdmin";
import ChatroomDefaultDropdownList from "../dropdown/dropdownList/chatroomDefault";
import ChatroomOwnerDropdownList from "../dropdown/dropdownList/chatroomOwner";
import FriendDropdownList from "../dropdown/dropdownList/friend";
import ChatroomInviteModal from "../modal/chatroom/invite/chatroomInviteModal";
import ChatroomSettingModal from "../modal/chatroom/setting/chatroomSettingModal";
import AddFriendModal from "../modal/friend/add/addFriendModal";
import AddUserIcon from "./icon/addUser";
import InviteUserIcon from "./icon/inviteUser";
import SettingIcon from "./icon/setting";
import "./sideBar.scss";
import SidebarItem from "./sideBarItem";
import {
  chatroomPermission,
  DM,
  dropdownMenuInfo,
  sidebarProperty,
  sidebarProps,
  userItemProps,
} from "./sideBarType";

function SideBar(prop: sidebarProps) {
  const [userList, setUserList] = useState<userItemProps[] | null>(null);
  const [myProfile, setMyProfile] = useState<{id: number, nickname: string}>({id: 0, nickname: ''});
  const modalHandler = prop.modalHandler;
  const isModalOpen = modalHandler.isModalOpen;
  const handleModalOpen = modalHandler.handleModalOpen;
  const handleModalClose = modalHandler.handleModalClose;

  // first render -> get userList according to sidebarType(prop.title)
  useEffect(() => {
    const getChannelmember = async () => {
      const data = await axios.get(
        process.env.REACT_APP_SERVER_ADDRESS + `/channel/members/${prop.roomId}`,
        { withCredentials: true }
      );
      setUserList(data.data);
    }
    if (prop.title === sidebarProperty.chatMemberList) {
      getChannelmember();
    }
    else if (prop.title === sidebarProperty.friendList) {
      fetchFriendList();
      getNewDM();
    }
    else if (prop.title === sidebarProperty.observerList)
      ioChannel.emit("observerList", prop.roomId);

    getMyProfile();
  }, []);

  useEffect(() => {
    const addMember = (newMemArr: userItemProps[]) => {
      setUserList(newMemArr)
    }
    const removeMember = (leavedArr: userItemProps[]) => {
      setUserList(leavedArr);
    }

    if (prop.title === sidebarProperty.chatMemberList) {
      ioChannel.on("channelMemberAdd", (newMember: userItemProps) => {
        if (userList && !userList.some(user => user.id === newMember.id)) {
          const newMemArr = [...userList, newMember]
          addMember(newMemArr);
        }
      });
      ioChannel.on("channelMemberRemove", (userId) => {
        if (userList) {
          const leavedArr = userList.filter(user => user.id !== userId);
          removeMember(leavedArr);
        }
      });
    }
  }, [userList, prop.title])

  const getMyProfile = async () => {
		try {
			const response = await axios.get(
				`${process.env.REACT_APP_SERVER_ADDRESS}/user/me`, {withCredentials: true}
			);
			setMyProfile({id: response.data.id, nickname: response.data.nickname});
		} catch (e) {
			console.log(`[MyProfile] ${e}`);
		}
	}

  // to contextMenu
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);
  const [result, setResult] = useState<dropdownMenuInfo | null>();

  const handleContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      setAnchorPoint({ x: event.pageX, y: event.pageY });
      setShow(true);
    },
    [setShow, setAnchorPoint]
  );

  const handleClick = useCallback(() => {
    if (show && !isModalOpen.gameSetting) setShow(false);
  }, [show]);

  window.addEventListener("click", handleClick);
  useEffect(() => {
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [isModalOpen]);

  //get dropdownMenuInfo according to user's relation & sidebarType
  const contextMenuHandler = (
    e: React.MouseEvent,
    dropdownMenuInfo: dropdownMenuInfo
  ) => {
    handleContextMenu(e);
    setResult(dropdownMenuInfo);
  };

  // FriendList func
  const fetchFriendList = async () => {
		try {
      let newUserList: userItemProps[] = [];
			const response = await axios.get(
				`${process.env.REACT_APP_SERVER_ADDRESS}/community/friend`,
				{
					withCredentials: true,
				}
			);
			response.data.map((user: any) => newUserList.push({
				id: user.other.id,
				avatar: user.other.avatar,
        status: 1,
        nickname: user.other.nickname,
        alert: false
			}));
      setUserList(newUserList);
		} catch (e) {
			console.log(`[FriendListError] ${e}`);
		}
	};

  useEffect(() => {
    //친구 수락 수신
    ioCommunity.on("friendAcceptToClient", async (friendID: number) => {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_ADDRESS}/user/${friendID}`,
        { withCredentials: true, }
      );
      const newUser: userItemProps = {
        id: friendID,
        avatar: response.data.avatar,
        status: 1,
        nickname: response.data.nickname,
        alert: false
      };
      setUserList(userList => userList? [...userList, ] : [newUser]);
    });

    //친구 차단 수신
    ioCommunity.on("blockResponseToClient", async (friendID: number) => {
      setUserList(userList => userList? userList.filter(user => user.id !== friendID) : userList);
    });

    //친구or차단 취소 수신
    ioCommunity.on("relationDeleteToClient",
    async (id: number, isFriendly: boolean) => {
      if (isFriendly)
        setUserList(userList => userList? userList.filter(user => user.id !== id) : userList);
      else {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_SERVER_ADDRESS}/community/${id}`,
            { withCredentials: true }
          );
          if (response) {
            const newUser: userItemProps = {
              id: id,
              avatar: response.data.avatar,
              status: 1,
              nickname: response.data.nickname,
              alert: false
            };
            setUserList(userList => userList? [...userList, ] : [newUser]);
          }
        } catch (e) {
          console.log(`[relationDeleteToClient] ${e}`);
        }
      }
    });
  }, []);

  // direct message
  const [DMopen, setDMOpen] = useState<boolean>(false);
  const [friend, setFriend] = useState<userItemProps>({
    id: 0,
    avatar: '',
    status: 1,
    nickname: '',
    alert: false
  });
	const friendRef = useRef<userItemProps | null>(null);
	const timerRef = useRef<NodeJS.Timeout>();

  const getNewDM = () => {
    ioCommunity.on('dmToClient', (newDM: DM) => {
      if (!friendRef.current) alertNewDM(newDM.id);
    });
  }

  const alertNewDM = (senderID: number) => {
    setUserList((userList) => userList?
      userList.map(user =>
        user.id === senderID ? { ...user, alert: true } : user
      ) : userList
    );
    timerRef.current = setTimeout(() => {
      setUserList((userList) => userList?
        userList.map(user =>
          user.id === senderID ? { ...user, alert: false } : user
        ) : userList
      );
    }, 1200);
  }

  const openDM = (e: React.MouseEvent<HTMLLIElement>) => {
    if (prop.title === sidebarProperty.friendList) {
      if (userList) {
        friendRef.current = userList.filter(user => user.id === e.currentTarget.value)[0];
        setFriend(friendRef.current);
      }
      if (timerRef.current) {
        if (userList)
          userList.map(user =>
            user.id === e.currentTarget.value ? { ...user, alert: true } : user
          );
        clearTimeout(timerRef.current);
      }
      if (!DMopen) setDMOpen(true);
    }
	}
	const closeDM = () => {
    setDMOpen(false);
    friendRef.current = null;
  }

  return (
    <aside>
      <div className="sidebar-header">
        <div className="sidebar-title">{prop.title}</div>
        <div className="sidebar-icon-list">
          {/* set icon according to sidebarType */}
          {prop.title == sidebarProperty.friendList ? (
            // addFriendModal
            <AddUserIcon
              onClick={() => {
                handleModalOpen("addFriend");
              }}
            />
          ) : prop.title == sidebarProperty.chatMemberList ? (
            // inviteUserModal, chatroomSettingModal (with chatroomId), handler socket
            <>
              <InviteUserIcon
                onClick={() => {
                  handleModalOpen("chatroomInvite");
                }}
              />
              <SettingIcon
                onClick={() => {
                  handleModalOpen("chatroomSetting");
                }}
              />
            </>
          ) : null}
        </div>
      </div>
      <ul className="user-list">
        {userList ?
        userList.map(user =>
          <li onClick={openDM} value={user.id}>
            {user.alert && (<span className="alert-overlay"></span>)}
            <SidebarItem
              itemType={prop.title}
              key={user.id}
              itemInfo={user}
              contextMenuHandler={contextMenuHandler}
              roomId={prop.roomId}
              userId={myProfile.id}
              targetId={user.id}
            />
          </li>
        ) : null}
      </ul>
      {DMopen && (
				<DirectMessage
          myProfile={myProfile}
					friend={friend}
          friendRef={friendRef}
					closeDM={closeDM}
          alertNewDM={alertNewDM}
				/>
			)}

      {/* anchorPoint, dropdownMenuInfo, userId, targetId */}
      {show && prop.title === sidebarProperty.friendList && result ? (
        <FriendDropdownList
          anchorPoint={anchorPoint}
          dropdownListInfo={result}
          modalHandler={modalHandler}
        />
      ) : (
        ""
      )}
      {show &&
      prop.title === sidebarProperty.chatMemberList &&
      result?.permission == chatroomPermission.member ? (
        <ChatroomDefaultDropdownList
          anchorPoint={anchorPoint}
          dropdownListInfo={result}
          modalHandler={modalHandler}
        />
      ) : (
        ""
      )}
      {show &&
      prop.title === sidebarProperty.chatMemberList &&
      result?.permission == chatroomPermission.admin ? (
        <ChatroomAdminDropdownList
          anchorPoint={anchorPoint}
          dropdownListInfo={result}
          modalHandler={modalHandler}
        />
      ) : (
        ""
      )}
      {show &&
      prop.title === sidebarProperty.chatMemberList &&
      result?.permission == chatroomPermission.owner ? (
        <ChatroomOwnerDropdownList
          anchorPoint={anchorPoint}
          dropdownListInfo={result}
          modalHandler={modalHandler}
        />
      ) : (
        ""
      )}

      {isModalOpen.addFriend ? (
        <AddFriendModal
          open={isModalOpen.addFriend}
          close={() => handleModalClose("addFriend")}
        />
      ) : (
        ""
      )}
      {isModalOpen.chatroomInvite ? (
        <ChatroomInviteModal
          open={isModalOpen.chatroomInvite}
          close={() => handleModalClose("chatroomInvite")}
          roomId={prop.roomId}
        />
      ) : (
        ""
      )}
      {isModalOpen.chatroomSetting ? (
        <ChatroomSettingModal
          open={isModalOpen.chatroomSetting}
          close={() => handleModalClose("chatroomSetting")}
          roomId={prop.roomId}
        />
      ) : (
        ""
      )}
    </aside>
  );
}

export default SideBar;
