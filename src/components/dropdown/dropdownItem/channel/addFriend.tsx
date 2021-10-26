import axios from "axios";
import React from "react";
import DefaultDropdownItem from "../../itemTemplate/default/item";

type ItemProps = {
  targetId: number;
};

const AddFriendItem = (prop: ItemProps) => {
  const handleAddFriend = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_SERVER_ADDRESS}/friend/${prop.targetId}`);
    } catch (error) {
    }
  };

  return (
    <DefaultDropdownItem
      title="친구 추가하기"
      color="black"
      callback={handleAddFriend}
    />
  );
}

export default AddFriendItem;
