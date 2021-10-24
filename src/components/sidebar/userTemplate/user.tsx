import React from "react";
import { User } from "../../../views/profile/profileType";
import { DMUser, Status } from "../sidebarType";
import "./user.scss";

const UserItem = (prop: User | DMUser) => {
  const statusToImage = (status: number) => {
    switch (status) {
      case 0:
        return Status.OFFLINE;
      case 1: 
        return Status.ONLINE;
      case 2:
        return Status.INGAME;
      default:
        return Status.OFFLINE;
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
