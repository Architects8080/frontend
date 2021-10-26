import React from "react";
import { useHistory } from "react-router";
import DefaultDropdownItem from "../itemTemplate/default/item";

type props = {
  targetId: number;
};

const ViewProfileItem = (prop: props) => {
  const history = useHistory();

  return (
    <>
      <DefaultDropdownItem
        title="프로필 보기"
        color="black"
        callback={() => {
          history.push(`/profile/${prop.targetId}`);
        }}
      />
    </>
  );
}

export default ViewProfileItem;
