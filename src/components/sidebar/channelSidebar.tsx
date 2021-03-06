import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { ioChannel, ioCommunity } from "../../socket/socket";
import DirectMessage from "../directMessage/directMessage";
import ChannelAdminDropdownList from "../dropdown/dropdownList/channelAdmin";
import ChannelMemberDropdownList from "../dropdown/dropdownList/channelMember";
import ChannelOwnerDropdownList from "../dropdown/dropdownList/channelOwner";
import ChannelInviteModal from "../modal/channel/invite/channelInviteModal";
import ChannelSettingModal from "../modal/channel/setting/channelSettingModal";
import snackbar from "../snackbar/snackbar";
import InviteUserIcon from "./icon/inviteUser";
import SettingIcon from "./icon/setting";
import "./sidebar.scss";
import SidebarItem from "./sidebarItem";
import { ChannelMember, ContextMenuInfo, DM, MemberRole, SidebarProperty, SidebarProps} from "./sidebarType";


const ChannelSidebar = (prop: SidebarProps) => {
  const history = useHistory();
  const [memberList, setMemberList] = useState<ChannelMember[]>([]);
  const [myProfile, setMyProfile] = useState<{ id: number; nickname: string; role: MemberRole}>({
    id: 0,
    nickname: "",
    role: MemberRole.MEMBER,
  });
  const [userId, setUserId] = useState(0);

  const modalHandler = prop.modalHandler;
  const isModalOpen = modalHandler.isModalOpen;
  const handleModalOpen = modalHandler.handleModalOpen;
  const handleModalClose = modalHandler.handleModalClose;

  useEffect(() => {

    getChannelmember();
  }, []);

  useEffect(() => {

    ioChannel.on("addChannelMember", (channelId: number, member: ChannelMember) => {
      console.log(`addChannelMember!, member : `, member);
      if (!memberList.some(joinMember => joinMember.userId == member.userId)) {
        setMemberList(memberList => [...memberList, member]);
      }
    });

    ioChannel.on("removeChannelMember", (channelId: number, userId: number) => {
      console.log(`removeChannelMember!`);
      setMemberList(memberList => memberList.filter(joinMember => joinMember.userId != userId));
      axios
      .get(`${process.env.REACT_APP_SERVER_ADDRESS}/user/me`)
      .then(user => {
        if (userId == user.data.id) {
          snackbar.info("????????? 2?????? ?????? ???????????????.");
          snackbar.error("???????????? ?????????????????????.");
          history.push(`/main`);
        }
      });
    });

    ioChannel.on("updateChannelMember", (channelId: number, updateMember: ChannelMember) => {
      console.log(`updateChannelMember! : `, updateMember);

      setMemberList(memberList => memberList.map(member => {
        if (member.userId == userId)
          member.status = 1; //ONLINE
        if (member.userId == updateMember.userId) {
          return updateMember;
        }
        return member;
      }));

      axios
      .get(`${process.env.REACT_APP_SERVER_ADDRESS}/user/me`)
      .then(user => {
        if (updateMember.userId == user.data.id) {
          setMyProfile(myProfile => ({...myProfile, role: updateMember.role}));
        }
      });
    });
  }, []);

  const getChannelmember = async () => {
    try {
      const user = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/user/me`);
      setUserId(user.data.id)
    } catch (error) {
      
    }

    try {
      const memberList = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/channel/${prop.channelId}/member`);
      setMemberList(memberList.data);
  
      const response = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/user/me`);
      const me = memberList.data.find((member: ChannelMember) => {
        return member.userId == response.data.id;
      });

      //TODO: not update state
      if (me) {
        setMyProfile((prevState) => { 
          return { ...prevState, id: response.data.id, nickname: response.data.nickname, role: me.role}
        });
      }
    } catch (error) {
      console.log(`[getChannelmember] ${error}`);
    }
  }

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
    setResult(dropdownMenuInfo);
  };

  return (
    <aside>
      <div className="sidebar-header">
        <div className="sidebar-title">{SidebarProperty.CHAT_MEMBER_LIST}</div>
        <div className="sidebar-icon-list">
          <InviteUserIcon onClick={() => {handleModalOpen("channelInvite");}}/>
          <SettingIcon onClick={() => {handleModalOpen("channelSetting");}}/>
        </div>
      </div>
      <ul className="user-list">
        {/* TODO: update  */}
        {memberList ? memberList.map((member) => (
          <SidebarItem
            key={member.userId}
            itemType={SidebarProperty.CHAT_MEMBER_LIST}
            contextMenuHandler={contextMenuHandler}
            channelId={prop.channelId}
            userId={myProfile.id}
            userRole={myProfile.role}
            targetId={member.userId}
            targetUser={member.user}
            targetRole={member.role}
            targetStatus={member.status}
          />
        )) : null}
      </ul>

      {show && result?.myRole == MemberRole.MEMBER ? (
        <ChannelMemberDropdownList
          anchorPoint={anchorPoint}
          dropdownListInfo={result}
          modalHandler={modalHandler}
        />
      ) : (
        ""
      )}
      {show && result?.myRole == MemberRole.ADMIN ? (
        <ChannelAdminDropdownList
          anchorPoint={anchorPoint}
          dropdownListInfo={result}
          modalHandler={modalHandler}
        />
      ) : (
        ""
      )}
      {show && result?.myRole == MemberRole.OWNER ? (
        <ChannelOwnerDropdownList
          anchorPoint={anchorPoint}
          dropdownListInfo={result}
          modalHandler={modalHandler}
        />
      ) : (
        ""
      )}

      {/* Modal */}
      <ChannelInviteModal
        open={isModalOpen.channelInvite}
        close={() => handleModalClose("channelInvite")}
        channelId={prop.channelId}/>
      <ChannelSettingModal
        open={isModalOpen.channelSetting}
        close={() => handleModalClose("channelSetting")}
        channelId={prop.channelId}/>
    </aside>
  );
}

export default ChannelSidebar;
