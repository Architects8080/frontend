import React from "react";
import { User } from "../../../views/profile/profileType";
import { DMUser, StatusIcon } from "../sidebarType";
import "./user.scss";

const UserItem = (prop: User | DMUser) => {
  const statusToImage = (status: number) => {
    switch (status) {
      case 0:
        return StatusIcon.OFFLINE;
      case 1: 
        return StatusIcon.ONLINE;
      case 2:
        return StatusIcon.PLAYING;
      default:
        return StatusIcon.OFFLINE;
    }
  }
  return (
    <div className="user-item-wrap">
      <div className="user-photo-wrap">
        <div className="profile">
          <img
            className="avatar"
            src={prop.avatar}
            alt="cannot loaded avatar"
          />
        </div>
        <img className="status" src={statusToImage(prop.status)} alt="cannot loaded status" />
      </div>
      <div className="nickname">{prop.nickname}</div>
    </div>
  );
}

export default UserItem;
