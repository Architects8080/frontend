import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { ioCommunity } from "../../socket/socket";
import { User } from "../../views/profile/profileType";
import NotificationItem from "../dropdown/itemTemplate/notification/item";
import snackbar from "../snackbar/snackbar";
import "./dropdown.scss";

//List를 Main에서 불러오면, 리스트 유무에 따른 icon img 변경
//Button을 누르면 Dropdown open.

type DropdownProps = {
  isActive: boolean;
  nicknameLength: number;
  updateIcon: (count: number) => void;
};

enum NotificationType {
  FRIEND = 0,
  CHANNEL,
}

type Notification = {
  id: number;
  senderId: number;
  receiverId: number;
  sender: User;
  //채널 초대: channelId
  //친구 요청: senderId
  targetId: number;
  type: NotificationType;
};

type NotificationItemProp = {
  id: number;
  targetId: number;
  type: NotificationType
  title: string;
  description: string;
  acceptCallback: (id: number) => void;
  rejectCallback: (id: number) => void;
};

const NotificationOverlay = (prop: DropdownProps) => {
  const [notiList, setNotiList] = useState<NotificationItemProp[]>([]);

  useEffect(() => {
    prop.updateIcon(notiList.length);
  }, [notiList]);

  const getTitleFromNotification = (noti: Notification) => {
    switch (noti.type) {
      case NotificationType.FRIEND:
        return "친구 요청";
      case NotificationType.CHANNEL:
        return "채팅방 초대";
    }
  };

  const getDescriptionFromNotification = (noti: Notification) => {
    switch (noti.type) {
      case NotificationType.FRIEND:
        return `${noti.sender.nickname}님의 친구 요청입니다. 수락하시겠습니까?`;
      case NotificationType.CHANNEL:
        return `${noti.sender.nickname}님의 채팅방 초대 요청입니다. 수락하시겠습니까?`;
    }
  };

  const acceptCallback = async (id: number) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_SERVER_ADDRESS}/notification/accept/${id}`,
      );
    } catch (error) {
    }

    const acceptedNoti = notiList.find((noti) => noti.id == id);
    console.log(`accept ? : `, acceptedNoti);

    setNotiList((notiList) => {
      return notiList.filter((noti) => {
        return noti.id != id;
      });
    });

    //Redirect
    if (acceptedNoti && acceptedNoti.type == NotificationType.CHANNEL) {
      try {
        const access = await axios.post(`${process.env.REACT_APP_SERVER_ADDRESS}/channel/${acceptedNoti.targetId}/member`);
      } catch (error: any) {
        if (error.response.status != 409) {
          if (error.response.status == 403)
            snackbar.error("채널에 접속할 수 없습니다.");
          else
            snackbar.error("알 수 없는 오류가 발생했습니다.")
          return
        }
      }
      window.location.href = `${process.env.REACT_APP_CLIENT_ADDRESS}/channel/${acceptedNoti.targetId}`;
    }
  };

  const rejectCallback = async (id: number) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_SERVER_ADDRESS}/notification/${id}`,
      );
    } catch (error) {
      
    }

    setNotiList((notiList) => {
      return notiList.filter((noti) => {
        return noti.id != id;
      });
    });
  };

  const notificationToProps = (noti: Notification) => {
    return {
      id: noti.id,
      targetId: noti.targetId,
      type: noti.type,
      title: getTitleFromNotification(noti),
      description: getDescriptionFromNotification(noti),
      acceptCallback: acceptCallback,
      rejectCallback: rejectCallback,
    };
  };

  useEffect(() => {
    fetchNoti(); // notification 목록 불러오기

    // noti 수신
    ioCommunity.on("notificationReceive", async (noti: Notification) => {
      setNotiList((notiList) => [...notiList, notificationToProps(noti)]);
    });
  }, []);

  const fetchNoti = () => {
    axios
      .get(`${process.env.REACT_APP_SERVER_ADDRESS}/notification`, {
        withCredentials: true,
      })
      .then((response) => {
        const newNotiList = response.data.map((noti: Notification) => {
          return notificationToProps(noti);
        });
        setNotiList(newNotiList);
      })
      .catch((e) => {
        console.log(`[fetchNotiList] ${e}`);
      });
  };

  return (
    <div
      className="notification-wrap"
      style={{ right: 40 + 48 + 50 + prop.nicknameLength * 10.9 }}
    >
      <div className={`dropdown ${prop.isActive ? "active" : "inactive"}`}>
        {notiList.map((noti) => (
          <NotificationItem
            key={noti.id}
            title={noti.title}
            description={noti.description}
            acceptCallback={() => {
              acceptCallback(noti.id);
            }}
            rejectCallback={() => {
              rejectCallback(noti.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
export default NotificationOverlay;
