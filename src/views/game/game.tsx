import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { io } from "../../socket/socket";
import { GameInfo } from "./gameType";
import Header from "../../components/header/header";
import Pong from "./pong/pong";
import "./game.scss";
import ModalHandler from "../../components/modal/modalhandler";

const Game = () => {
  const { gameId } = useParams<{ gameId: string }>();

  const modalHandler = ModalHandler();
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  var temp: GameInfo | null = null;

  var isGetPlayerInfo = false;
  const [playerInfo, setPlayerInfo] = useState<{ [key: string]: any }>({
    player1: {},
    player2: {},
  });

  const getPlayerInfo = async (playerId: number): Promise<any> => {
    return axios.get(
      process.env.REACT_APP_SERVER_ADDRESS + "/user/" + playerId
    );
  };

  useEffect(() => {
    io.on("update", async (id, updateInfo: GameInfo) => {
      if (id == gameId) {
        temp = updateInfo;
        setGameInfo(updateInfo);
      }
      if (!isGetPlayerInfo && temp) {
        isGetPlayerInfo = true; //to call api once
        const player1Data = await getPlayerInfo(temp.player1.id);
        const player2Data = await getPlayerInfo(temp.player2.id);
        playerInfo["player1"] = player1Data.data;
        playerInfo["player2"] = player2Data.data;
      }
    });
    io.on("vanished", (id: string) => {
      if (id == gameId) {
        window.location.href = `${process.env.REACT_APP_CLIENT_ADDRESS}/main`;
      }
    });
    io.emit("observe", [gameId]);
  }, []);

  return (
    <>
      <Header isLoggedIn={true} />
      <div className="page">
        {gameInfo ? (
          <div className="game-wrap">
            <div className="game-scoreboard">
              <div className="userinfo">
                <img
                  className="user-avatar"
                  alt="user-avatar"
                  src={playerInfo["player1"].avatar}
                />
                <div className="user-nickname">
                  {playerInfo["player1"].nickname}
                </div>
              </div>
              <div className="score">
                {gameInfo?.player1.score} : {gameInfo?.player2.score}
              </div>
              <div className="userinfo">
                <img
                  className="user-avatar"
                  alt="user-avatar"
                  src={playerInfo["player2"].avatar}
                />
                <div className="user-nickname">
                  {playerInfo["player2"].nickname}
                </div>
              </div>
            </div>
            <div className="game-window">
              <Pong gameId={gameId} gameInfo={gameInfo}></Pong>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
}

export default Game;
