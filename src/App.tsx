import React from "react";
import { Route } from "react-router-dom";
import Register from "./views/auth/register/register";
import Main from "./views/main/main";
import "./App.scss";
import Profile from "./views/profile/profile";
import Game from "./views/game/game";
import Setting from "./views/setting/setting";
import OTP from "./views/auth/otp/otp";
import Login from "./views/auth/login";
import TestLogin from "./views/auth/test";
import BlockList from "./views/blocklist/blocklist";
import Channel from "./views/channel/channel";

function App() {
  return (
    <div className="app">
      <Route exact path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/main" component={Main} />
      <Route path="/test" component={TestLogin} />
      <Route path="/profile/:userId" component={Profile} />
      <Route path="/game/:gameId" component={Game} />
      <Route path="/setting" component={Setting} />
      <Route path="/otp" component={OTP} />
      <Route path="/register" component={Register} />
      <Route path="/channel/:channelId" component={Channel} />
      <Route path="/blocklist" component={BlockList} />
    </div>
  );
}

export default App;