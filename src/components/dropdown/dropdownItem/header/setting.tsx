import React from "react";
import { useHistory } from "react-router";
import DefaultDropdownItem from "../../itemTemplate/default/item";

const SettingItem = () => {
  const history = useHistory();

  return (
    <DefaultDropdownItem
      title="환경 설정"
      color="black"
      callback={() => {
        history.push('/setting');
      }}
    />
  );
}

export default SettingItem;
