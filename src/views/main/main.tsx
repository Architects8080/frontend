import React, { useState, useEffect } from "react";
import Button from "../../components/button/button";
import EmptyPageInfo from "../../components/emptyPage/empty";
import Header from "../../components/header/header";
import ChannelItem, { ChannelItemProps } from "./channelItem/item";
import "./main.scss";
import ModalHandler from "../../components/modal/modalhandler";
import axios from "axios";
import GameModalListener from "../../components/modal/gameModalListener";
import { io, ioChannel } from "../../socket/socket";
import FriendSidebar from "../../components/sidebar/friendSidebar";
import { ModalManager } from "../../components/sidebar/sidebarType";
import ChannelCreateModal from "../../components/modal/channel/create/channelCreateModal";

enum ChannelCategory {
  CHANNEL_LIST,
  MY_CHANNEL_LIST,
}

const Main = () => {
  const modalHandler = ModalHandler();
  const [isWaiting, setIsWaiting] = useState(false);

  const modalListener: ModalManager = {
    handleModalClose: modalHandler.handleModalClose,
    handleModalOpen: modalHandler.handleModalOpen,
    isModalOpen: modalHandler.isModalOpen,
    setWaiting: setIsWaiting,
  }

  const [category, setCategory] = useState(
    ChannelCategory.CHANNEL_LIST
  );

  const handleAddWaiting = () => {
    setIsWaiting(true);
    io.emit('joinQueue');
  }

  const handleRemoveWaiting = () => {
    setIsWaiting(false);
    io.emit('leaveQueue');
  }

  const changeCategory = (category: ChannelCategory) => {
    return () => {
      setCategory(category);
    };
  };

  const [channelList, setChannelList] = useState<ChannelItemProps[]>([]);
  const [myChannelList, setMyChannelList] = useState<ChannelItemProps[]>([]);

  const getAllChannel = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/channel`);
      if (response.data.length != 0)
        setChannelList(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  const getMyChannel = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/channel/me`);
      if (response.data.length != 0)
        setMyChannelList(response.data);
    } catch (error) {
      console.log(error);
    }
  }

	useEffect(() => {
		getAllChannel();
    getMyChannel();
	}, [category]);

  useEffect(() => {
    ioChannel.on('addMyChannel', (newChannel: ChannelItemProps) => {
      console.log(`addMyChannel!`);
      if (!myChannelList.some(myChannel => myChannel.id == newChannel.id)) {
        setMyChannelList(myChannelList => [...myChannelList, newChannel]);
      }
    });

    ioChannel.on('removeMyChannel', (channelId: number) => {
      console.log(`removeMyChannel!`);
      setMyChannelList(myChannelList => myChannelList.filter(myChannel => myChannel.id != channelId));
    });

    ioChannel.on('addChannel', (newChannel: ChannelItemProps) => {
      console.log(`addChannel!`);
      if (!channelList.some(channel => channel.id == newChannel.id)) {
        setChannelList(channelList => [...channelList, newChannel]);
      }
    });

    ioChannel.on('removeChannel', (channelId: number) => {
      console.log(`removeChannel!`);
      setChannelList(channelList => channelList.filter(channel => channel.id != channelId));
    });

    ioChannel.on('updateChannel', (channel: ChannelItemProps) => {
      setMyChannelList(channelList => channelList.map(item => {
        if (item.id == channel.id) 
          return channel
        return item;
      }));
      setChannelList(channelList => channelList.map(item => {
        if (item.id == channel.id) 
          return channel
        return item;
      }));
    });

    ioChannel.on('deleteChannel', (channelId: number) => {
      console.log(`deleteChannel!`);
      setChannelList(channelList => channelList.filter(channel => channel.id != channelId));
    });
  }, []);

  return (
    <>
      <Header isLoggedIn={true} />
      <div className="page">
        <FriendSidebar
          channelId={0}
          modalHandler={modalHandler}
        />
        <div className="main-wrap">
          <div className="button-list">
            <div className="button-left-side">
              <div className="focusable-button" tabIndex={1}>
                <Button
                  title="?????? ?????????"
                  onClick={changeCategory(ChannelCategory.CHANNEL_LIST)}
                />
              </div>
              <div className="focusable-button" tabIndex={1}>
                <Button
                  title="???????????? ?????????"
                  onClick={changeCategory(ChannelCategory.MY_CHANNEL_LIST)}
                />
              </div>
            </div>
            <div className="button-right-side">
              {
                isWaiting ? <Button title="?????? ????????????" onClick={handleRemoveWaiting} />
                : <Button title="?????? ??????" onClick={handleAddWaiting} />
              }
              <Button
                title="????????? ?????????"
                onClick={() => modalHandler.handleModalOpen("channelCreate")}
              />
            </div>
          </div>

          {(category === ChannelCategory.CHANNEL_LIST && channelList.length == 0)
            ? <EmptyPageInfo description={`?????? ???????????? ???????????? ????????????.\n'????????? ?????????' ???????????? ???????????? ??????????????????!`}/>
            : (category === ChannelCategory.MY_CHANNEL_LIST && myChannelList.length == 0)
              ? <EmptyPageInfo description={`?????? ???????????? ???????????? ????????????.\n?????? ????????? ???????????? ??????????????????!`}/> 
              : <div className="channel-list">
                  {category === ChannelCategory.CHANNEL_LIST && channelList
                    ? channelList.map(channel => (
                        <ChannelItem channel={channel} key={channel.id}/>
                      ))
                       : myChannelList ? myChannelList.map(channel => (
                          <ChannelItem channel={channel} key={channel.id}/>
                        )) : null
                  }
                </div>
          }
        </div>
      </div>
      <ChannelCreateModal
        open={modalHandler.isModalOpen.channelCreate}
        close={() => modalHandler.handleModalClose("channelCreate")}
      />
      <GameModalListener modalHandler={modalListener}/>
    </>
  );
}

export default Main;
