import axios from "axios";
import React from "react";
import { useHistory } from "react-router";
import { io } from "../../../socket/socket";
import DefaultDropdownItem from "../itemTemplate/default/item";

type ItemProps = {
  targetId: number;
};

const ObserveGameItem = (prop: ItemProps) => {
  const history = useHistory();
  const handleObserveGame = async () => {
    try {
      const gameroomId = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/game/gameroom/${prop.targetId}`);
      history.push(`/game/${gameroomId.data}`);
    } catch (error) {}
  };

  return (
    <DefaultDropdownItem
      title="게임 관전하기"
      color="black"
      callback={handleObserveGame}
    />
  );
}

export default ObserveGameItem;
