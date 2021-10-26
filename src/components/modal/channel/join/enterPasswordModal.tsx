import axios from "axios";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import "./enterPasswordModal.scss";

type EnterPasswordModalProps = {
  open: boolean;
  close: any;
  channelId: number;
};

const EnterPasswordModal = (prop: EnterPasswordModalProps) => {
  const history = useHistory();
  const Title = "채팅방 접속";
  const Description = "비밀번호를 입력해주세요.";

  const nickPlaceholder = "password";
  const buttonTitle = "접속";

  const [input, setInput] = useState("");
  const [errorText, setErrorText] = useState("");

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") setErrorText("");
    setInput(e.target.value);
  };

  const handleClose = () => {
    setInput("");
    prop.close();
  };

  const handleSubmitEvent = async () => {
    axios.post(`${process.env.REACT_APP_SERVER_ADDRESS}/channel/${prop.channelId}/member`, {
      password: input
    })
    .then(() => {
      prop.close();
      history.push(`/channel/${prop.channelId}`);
    })
    .catch((e) => {
      if (e.response.data.statusCode == 409) {
        prop.close();
        history.push(`/channel/${prop.channelId}`);
      }
      setErrorText("접속에 실패했습니다. 다시 시도해주세요.");
      setInput("");
    })
  }

  return (
    <div className={prop.open ? "modal-open modal-background" : "modal-background"}>
      <div className="modal-wrap">
        <div className="modal-header">
          <div className="title">{Title}</div>
          <img
            className="close"
            alt="close"
            src="/icons/modal/close.svg"
            onClick={handleClose}
          />
        </div>
        <div className="description">{Description}</div>
        <div className="search">
          <div className="search-bar">
            <img
              className="search-icon"
              alt="search-icon"
              src="/icons/modal/password.svg"
            />
            <input
              className="search-nickname"
              type="password"
              maxLength={4}
              value={input}
              onChange={handleUserInputChange}
              placeholder={nickPlaceholder}
            />
          </div>
          <div className="submit" onClick={handleSubmitEvent}>
            <div className="submit-title">{buttonTitle}</div>
          </div>
        </div>
        <div className="result">
          <div className={errorText === "" ? "" : "error"}>{errorText}</div>
        </div>
      </div>
    </div>
  );
}

export default EnterPasswordModal;
