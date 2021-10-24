import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ioCommunity } from "../../socket/socket";
import { User } from "../../views/profile/profileType";
import DirectMessage from "../directMessage/directMessage";
import FriendDropdownList from "../dropdown/dropdownList/friend";
import AddFriendModal from "../modal/friend/add/addFriendModal";
import snackbar from "../snackbar/snackbar";
import AddUserIcon from "./icon/addUser";
import "./sidebar.scss";
import SidebarItem from "./sidebarItem";
import {
  ContextMenuInfo,
  DM,  DMUser,  SidebarProperty, SidebarProps, 
} from "./sidebarType";

const FriendSidebar = (prop: SidebarProps) => {
  const [userList, setUserList] = useState<DMUser[]>([]);
  const [myProfile, setMyProfile] = useState<{ id: number; nickname: string }>({
    id: 0,
    nickname: "",
  });

  const modalHandler = prop.modalHandler;
  const isModalOpen = modalHandler.isModalOpen;
  const handleModalOpen = modalHandler.handleModalOpen;
  const handleModalClose = modalHandler.handleModalClose;

  useEffect(() => {
    fetchFriendList();
    getNewDM();
    getMyProfile();

    ioCommunity.on(
      "addFriendUser",
      async (friend: Omit<User, "alert">) => {
        const existIndex = userList.findIndex((f) => f.id == friend.id);
        if (existIndex == -1)
          setUserList((userList) => [...userList, { alert: false, ...friend }]);
      }
    );

    ioCommunity.on("removeFriendUser", async (friendId: number) => {
      setUserList((userList) => userList.filter((f) => f.id != friendId));
    });

    ioCommunity.on("changeUserStatus",  (id: number, status: number) => {
      setUserList(userList => userList.map((f) => { 
        if (f.id == id)
          f.status = status;
        return f;
      }));
    })
  }, []);

  const getMyProfile = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_ADDRESS}/user/me`,
      );
      setMyProfile({ id: response.data.id, nickname: response.data.nickname });
    } catch (e) {
      console.log(`[MyProfile] ${e}`);
    }
  };

  // to contextMenu
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);
  const [result, setResult] = useState<ContextMenuInfo | null>();

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
    dropdownMenuInfo: ContextMenuInfo
  ) => {
    handleContextMenu(e);
    //get info
    setResult(dropdownMenuInfo);
  };

  const friendToUserProps = (friend: any): DMUser => {
    return {
      id: friend.id,
      avatar: friend.avatar,
      status: friend.status,
      nickname: friend.nickname,
      alert: false,
    };
  };

  // FriendList func
  const fetchFriendList = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_ADDRESS}/friend`
      );
      const newUserList = response.data.map((user: any) =>
        friendToUserProps(user)
      );
      setUserList(newUserList);
    } catch (e) {
      console.log(`[FriendListError] ${e}`);
    }
  };

  // direct message
  const [DMopen, setDMOpen] = useState<boolean>(false);
  const [DMReceiver, setDMReceiver] = useState<DMUser>({
    id: 0,
    avatar: "",
    status: 1,
    nickname: "",
    alert: false,
  });
  const DMReceiverRef = useRef<DMUser | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  const getNewDM = () => {
    ioCommunity.on("dmToClient", (newDM: DM) => {
      if (!DMReceiverRef.current) alertNewDM(newDM.id);
    });
  };

  const alertNewDM = (senderID: number) => {
    setUserList((userList) =>
      userList
        ? userList.map((user) =>
            user.id === senderID ? { ...user, alert: true } : user
          )
        : userList
    );
    timerRef.current = setTimeout(() => {
      setUserList((userList) =>
        userList
          ? userList.map((user) =>
              user.id === senderID ? { ...user, alert: false } : user
            )
          : userList
      );
    }, 1200);
  };

  const openDM = (e: React.MouseEvent<HTMLLIElement>) => {
    if (userList) {
      DMReceiverRef.current = userList.filter(
        (user) => user.id === e.currentTarget.value
      )[0];

      if (DMReceiverRef.current.id == myProfile.id)
      {
        snackbar.error("자기 자신과의 대화는 불가능합니다.")
        return ;
      }
      setDMReceiver(DMReceiverRef.current);
    }

    if (timerRef.current) {
      if (userList)
        userList.map((user) =>
          user.id === e.currentTarget.value ? { ...user, alert: true } : user
        );
      clearTimeout(timerRef.current);
    }
    if (!DMopen) setDMOpen(true);
  };

  const closeDM = () => {
    setDMOpen(false);
    DMReceiverRef.current = null;
  };

  return (
    <aside>
      <div className="sidebar-header">
        <div className="sidebar-title">{SidebarProperty.FRIEND_LIST}</div>
        <div className="sidebar-icon-list">
          <AddUserIcon onClick={() => {handleModalOpen("addFriend");}}/>
        </div>
      </div>
      <ul className="user-list">
        {userList ? userList.map((user) => (
          <li onClick={openDM} value={user.id} key={user.id}>
            {user.alert && <span className="alert-overlay"></span>}
            <SidebarItem
              contextMenuHandler={contextMenuHandler}
              itemType={SidebarProperty.FRIEND_LIST}
              userId={myProfile.id}
              targetId={user.id}
              targetUser={user}
            />
          </li>
        )): null}
      </ul>
      {DMopen && (
        <DirectMessage
          myProfile={myProfile}
          DMReceiver={DMReceiver}
          DMReceiverRef={DMReceiverRef}
          closeDM={closeDM}
          alertNewDM={alertNewDM}
        />
      )}

      {show && result ? (
        <FriendDropdownList
          anchorPoint={anchorPoint}
          dropdownListInfo={result}
          modalHandler={modalHandler}
        />
      ) : (
        ""
      )}

      {/* Modal */}
      <AddFriendModal
        open={isModalOpen.addFriend}
        close={() => handleModalClose("addFriend")}/>
    </aside>
  );
}

export default FriendSidebar;
