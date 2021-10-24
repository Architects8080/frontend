import axios from "axios";
import React, { useEffect, useState } from "react";
import BlockListItem from "../dropdownItem/header/blockList";
import LogoutItem from "../dropdownItem/header/logout";
import SettingItem from "../dropdownItem/header/setting";
import ViewProfileItem from "../dropdownItem/viewProfile";
import "./dropdownList.scss";

type User = {
  id: number;
  nickname: string;
  intraLogin: string;
  avatar: string;
  ladderPoint: number;
  ladderLevel: number;
};

const HeaderDropdownList = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/user/me`)
    .then(response => {
      setUser(response.data);
    })
    .catch(() => {})
  }, []);

  return (
    <>
      { user ?
        <div className="dropdown-list-wrap dropdown-header">
          <ViewProfileItem targetId={user.id} />
          <SettingItem /> 
          <BlockListItem />
          <LogoutItem />
        </div>
        : ""
      }
    </>
  );
}

export default HeaderDropdownList;
