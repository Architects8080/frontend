import axios from "axios";
import DefaultDropdownItem from "../../itemTemplate/default/item";

type ItemProps = {
  targetId: number;
};

const DeleteFriendItem = (prop: ItemProps) => {
  const handleDeleteFriend = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_SERVER_ADDRESS}/friend/${prop.targetId}`
      );
    } catch (error) {
    }
  };

  return (
    <DefaultDropdownItem
      title="친구 끊기"
      color="red"
      callback={handleDeleteFriend}
    />
  );
}

export default DeleteFriendItem;
