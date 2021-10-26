import React, { useEffect, useState } from "react";
import { GameType, Match, MatchPlayer } from "../profileType";
import "./item.scss";

const GameLogItem = (match: Match) => {

  const [leftPlayer, setLeftPlayer] = useState<MatchPlayer>(match.players[0]);
  const [rightPlayer, setRightPlayer] = useState<MatchPlayer>(match.players[1]);
  const [isVictory, setIsVictory] = useState(false);
  const [timestamp, setTimestamp] = useState<string>("");
  const [gamelength, setGamelength] = useState<string>("");

  const getTimestamp = () => {
    var dateDiff = Math.trunc((new Date().getTime() - new Date(match.endAt).getTime()) / 1000);

    if (Math.trunc(dateDiff / 60) == 0) //60 second = 1 minute
      setTimestamp(dateDiff + " seconds ago");
    else if (Math.trunc(dateDiff / 3600) == 0) // 60 minute = 1 hour
      setTimestamp(Math.trunc(dateDiff / 60) + " minutes ago");
    else if (Math.trunc(dateDiff / (3600 * 24)) == 0) //1 hour * 24 = 1 day
      setTimestamp(Math.trunc(dateDiff / 3600) + " hours ago");
    else if (Math.trunc(dateDiff / (3600 * 24 * 30)) == 0) //1 day * 30 = 1 month
      setTimestamp(Math.trunc(dateDiff / (3600 * 24)) + " days ago");
    else if (Math.trunc(dateDiff / (3600 * 24 * 30 * 12)) == 0) //1 month * 12 = 1 year
      setTimestamp(Math.trunc(dateDiff / (3600 * 24 * 30)) + " months ago");
    else
      setTimestamp(Math.trunc(dateDiff / (3600 * 24 * 30 * 12)) + " years ago")
  };

  useEffect(() => {
    getTimestamp();
    setGamelength(Math.trunc((match.gameTime / 60)) + "m " + (match.gameTime % 60) + "s");
    if (match.targetId === leftPlayer.userId && leftPlayer.isWinner ||
        match.targetId === rightPlayer.userId && rightPlayer.isWinner)
      setIsVictory(true);
    else
      setIsVictory(false);
    if (!match.players[0].isLeft) {
      setLeftPlayer(match.players[1]);
      setRightPlayer(match.players[0]);
    }
  }, [match]);

  return (
    <div className="gamelog-wrap">
      <div className="gamelog-item">
        <div className={"gamelog " + (isVictory ? "win" : "lose")}>
          <div className="gamestats">
            <div className="gameinfo">{match.gameType === GameType.CUSTOM ? "Custom" : "Ladder"}</div>
            <div className="timestamp">{timestamp}</div>
            <div className={"gameresult " + (isVictory ? "win" : "lose")}>{isVictory ? "Victory" : "Defeat"}</div>
            <div className="gamelength">{gamelength}</div>
          </div>
        </div>

        <div className="detail">
          <div className="leftside">
            <div className="userinfo">
              <div className="nickname">{leftPlayer.user.nickname}</div>
              <div className="ladderinfo">
                {/* <div className="rank">Ladder Rank: #{leftPlayer.user.ladderLevel}</div> */}
                <div className="rank">Ladder Rank: {leftPlayer.tier}</div>
                <div className="point">Ladder Point : {leftPlayer.ladderPoint} ({(leftPlayer.ladderIncrease <= 0 ? "" : "+") + leftPlayer.ladderIncrease})</div>
              </div>
            </div>
            <img
              className="user-avatar"
              alt="user-avatar"
              src={leftPlayer.user.avatar}
            />
          </div>

          <div className="score">{leftPlayer.score} : {rightPlayer.score}</div>

          <div className="rightside">
            <img
              className="user-avatar"
              alt="user-avatar"
              src={rightPlayer.user.avatar}
            />
            <div className="userinfo">
              <div className="nickname">{rightPlayer.user.nickname}</div>
              <div className="ladderinfo">
                {/* <div className="rank">Ladder Rank: #{rightPlayer.user.ladderLevel}</div> */}
                <div className="rank">Ladder Rank: {rightPlayer.tier}</div>
                <div className="point">Ladder Point : {rightPlayer.ladderPoint} ({(rightPlayer.ladderIncrease <= 0 ? "" : "+") + rightPlayer.ladderIncrease})</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameLogItem;
