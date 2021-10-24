import axios from "axios";
import { useEffect, useState } from "react";
import EmptyPageInfo from "../../components/emptyPage/empty";
import Header from "../../components/header/header";
import { User } from "../profile/profileType";
import BlockItem from "./blockItem/blockItem";
import './blocklist.scss';

type BlockInfo = {
  other: User;
}

const BlockList = () => {

  const [blockList, setBlockList] = useState<BlockInfo[]>([]);

  const updateBlockList = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/block`);
      setBlockList(response.data);
    } catch (error) {
      
    }

  }

  const deleteItem = (id: number) => {
    setBlockList(blockList.filter((f) => f.other.id != id));
  }

  useEffect(() => {
    updateBlockList();
  }, []);

  return (
    <>
      <Header isLoggedIn={true}/>
      <div className="blocklist-page">
        <div className="blocklist-title">차단 목록</div>
          {blockList.length != 0 ? 
            <div className="blocklist">
              {blockList.map((item) => {
                return <BlockItem key={item.other.id} id={item.other.id} avatar={item.other.avatar} 
                        nickname={item.other.nickname} deleteItem={deleteItem}/>
              })}
            </div> 
            : <EmptyPageInfo description="차단한 유저가 없습니다"/>
          }
      </div>
    </>
  );
}

export default BlockList;