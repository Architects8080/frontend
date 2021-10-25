import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import AchievementItem from "../../components/achievement/achievement";
import EmptyPageInfo from "../../components/emptyPage/empty";
import Header from "../../components/header/header";
import GameModalListener from "../../components/modal/gameModalListener";
import ModalHandler from "../../components/modal/modalhandler";
import FriendSidebar from "../../components/sidebar/friendSidebar";
import snackbar from "../../components/snackbar/snackbar";
import GameLogItem from "./gamelog/item";
import "./profile.scss";
import { Achievement, GameTier, Match, MatchRatio, User } from "./profileType";

const Profile = () => {
  const history = useHistory();
  const modalHandler = ModalHandler();
  const { userId } = useParams<{ userId: string }>();

  const [user, setUser] = useState<User | null>(null);
  // const [topRate, setTopRate] = useState<string>("100");
  const [tier, setTier] = useState<GameTier>(GameTier.BRONZE);
  const [matchList, setMatchList] = useState<Match[] | null>(null);
  const [achievedList, setAchievedList] = useState<Achievement[] | null>(null);
  const achievementTitle = ['10회 승리', '20회 승리', '10회 이상 플레이', '20회 이상 플레이', 'OTP 등록'];

  const [winRatio, setWinRatio] = useState<MatchRatio | null>(null);
  const [search, setSearch] = useState("");

  const searchUser = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || search === "") return;

    axios
    .get(`${process.env.REACT_APP_SERVER_ADDRESS}/user/search/${search}`)
    .then((res) => {
      history.push(`/profile/${res.data.id}`);
    })
    .catch((err) => {
      snackbar.error("유저가 존재하지 않습니다.");
    });
  };

  const getTier = (ladderPoint: number) => {
    if (ladderPoint > 2100)
      return GameTier.DIAMOND;
    else if (ladderPoint > 1900)
      return GameTier.PLATINUM;
    else if (ladderPoint > 1600)
      return GameTier.GOLD;
    else if (ladderPoint > 1300)
      return GameTier.SILVER;
    else
      return GameTier.BRONZE;
  }

  // var gameLog;
  useEffect(() => {
    var win = 0;
    var total = 0;

    axios
    .all([
      axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/user/`),
      axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/user/${userId}`),
      axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/match/user/${userId}`),
      axios.get(`${process.env.REACT_APP_SERVER_ADDRESS}/achievement/${userId}`),
    ])
    .then(
      axios.spread((userList, userInfo, matchList, achievementList) => { //achievementList
        setUser(userInfo.data);
        // setTopRate(((userInfo.data.ladderLevel) / userList.data.length).toFixed(2).toString());
        setMatchList(matchList.data);
        setAchievedList(achievementList.data);
        matchList.data.map((match: any) => {
          if (match.players[0].userId == userInfo.data.id && match.players[0].isWinner == true ||
              match.players[0].userId != userInfo.data.id && match.players[0].isWinner == false)
            win++;
          total++;
        });

        setTier(getTier(userInfo.data.ladderPoint));
        setWinRatio({win: win, total: total, lose: total - win});
      })
    )
    .catch((err) => {
      history.push(`/main`);
    });

  }, [userId]);

  return (
    <>
      <Header isLoggedIn={true} />
      <div className="page">
        <FriendSidebar
          channelId={0}
          modalHandler={modalHandler}
        />
        <div className="profile-wrap">
          <div className="profile-header">
            {user && winRatio ? (
              <div className="profile-info">
                <img
                  className="user-avatar"
                  alt="user-avatar"
                  src={user.avatar}
                />
                <div className="profile-description">
                  <div className="profile-nickname">{user.nickname}</div>
                  <div className="profile-gameInfo">
                    <div className="ladder-rank">
                      {/* Ladder Rank : #{user.ladderLevel} ({topRate}% of top) */}
                      Ladder Tier : {tier}
                    </div>
                    <div className="ladder-point">
                      Ladder Point : {user.ladderPoint}
                    </div>
                    <div className="win-ratio-title">
                      {winRatio.total}G {winRatio.win}W {winRatio.lose}L
                    </div>
                    <div className="win-ratio">
                      Win ratio{" "}
                      {((winRatio.win / winRatio.total) * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            <div className="profile-side">
              <div className="profile-searchbar">
                <img
                  className="search-icon"
                  alt="search-icon"
                  src="/icons/searchbar/search.svg"
                />
                <input
                  className="search-nickname"
                  type="text"
                  placeholder={"search"}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={searchUser}
                />
              </div>
              <div className="achievement-list">
                { achievementTitle.map((title, index) => {
                    if (achievedList && achievedList.length != 0 && achievedList.find(achievement => achievement.id == index + 1))
                      return <AchievementItem key={index} title={title} isAchieve={true} />
                    else
                      return <AchievementItem key={index} title={title} isAchieve={false} />
                  })
                }
              </div>
            </div>
          </div>

          {!matchList || matchList.length == 0 ? (
            <EmptyPageInfo
              description={`전적이 존재하지 않습니다.\n다른 플레이어와 게임을 진행해보세요!`}
            />
          ) : (
            <div className="gameLogList">
              {user &&
                matchList.map((match: Match) => {
                  match.targetId = user.id;
                  match.players[0].tier = getTier(match.players[0].ladderPoint);
                  match.players[1].tier = getTier(match.players[1].ladderPoint);
                  return <GameLogItem {...match} />;
                })}
            </div>
          )}
        </div>
      </div>
      <GameModalListener modalHandler={modalHandler} />
    </>
  );
}

export default Profile;
