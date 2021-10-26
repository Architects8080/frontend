import React from "react";
import { useHistory } from "react-router";
import { io } from "../../../../socket/socket";
import DefaultDropdownItem from "../../itemTemplate/default/item";

const BlockListItem = () => {
  const history = useHistory();

  const handleRedirect = () => {
    history.push(`/blocklist`);
  };

  return (
    <DefaultDropdownItem
      title="차단 목록 보기"
      color="black"
      callback={handleRedirect}
    />
  );
}

export default BlockListItem;
