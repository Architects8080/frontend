import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { ioChannel } from "../../../../socket/socket";
import RadioButton from "../../../button/radio/radio";
import "./channelCreateModal.scss";

type ChannelCreateModalProps = {
  open: boolean;
  close: any;
};

export enum ChannelType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PROTECTED = 'protected',
}

export type ChannelCreateDto = {
  title: string;
  type: ChannelType;
  password?: string;
}

const ChannelCreateModal = (prop: ChannelCreateModalProps) => {
  const modalTitle = "채팅방 생성";
  const description = "채팅방을 만들어 다른 유저와 소통해보세요!";

  const roomPlaceholder = "방 제목";
  const buttonTitle = "생성하기";

  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");

  const [errorText, setErrorText] = useState("");
  const [descriptionText, setDescriptionText] = useState(
    "비밀번호는 숫자 4자리로 구성 가능합니다."
  );

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setDescriptionText("비밀번호는 숫자 4자리로 구성 가능합니다.");
    setErrorText("비밀번호를 적어주세요.");
    if (e.target.value.length !== 4)
      setErrorText("비밀번호를 숫자 4자리로 구성해주세요.");
    else if (
      isNaN(Number(e.target.value)) ||
      Number(e.target.value) < 0 ||
      Number(e.target.value) > 9999
    )
      setErrorText("비밀번호에는 숫자만 입력 가능합니다.");
    else {
      setErrorText("");
      setDescriptionText("");
    }
  };

  const handleClose = () => {
    setPassword("");
    prop.close();
  };

  const handleSubmitEvent = async () => {
    const channelDto: ChannelCreateDto = {
      title: title,
      type: channelType,
      password: password,
    };

    if (title !== '' && (channelType == ChannelType.PROTECTED && password.length == 4 || channelType != ChannelType.PROTECTED)) {
      axios.post(
        `${process.env.REACT_APP_SERVER_ADDRESS}/channel/`, channelDto
      ).then(response => {
        prop.close();
        window.location.href = `${process.env.REACT_APP_CLIENT_ADDRESS}/channel/${response.data.channelId}`
      }).catch(e => {
        console.log(e);
        setErrorText("채널 생성에 실패했습니다.");
      })
    }
  };

  const [channelType, setChannelType] = useState(ChannelType.PUBLIC);

  const handleChange = (selectedType: ChannelType) => {
    setChannelType(selectedType);
  };

  return (
    <div
      className={prop.open ? "modal-open modal-background" : "modal-background"}
    >
      <div className="channel-create-modal-wrap">
        <div className="modal-header">
          <div className="title">{modalTitle}</div>
          <img
            className="close"
            alt="close"
            src="/icons/modal/close.svg"
            onClick={handleClose}
          />
        </div>
        <div className="description">{description}</div>

        <div className="content">
          <div className="subtitle">방 제목</div>
          <input
            className="room-title"
            type="text"
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder={roomPlaceholder}
          ></input>
        </div>

        <div className="content">
          <div className="subtitle">구분</div>
          <div className="select">
            <RadioButton
              name="option"
              value={ChannelType.PUBLIC}
              label="Public"
              isChecked={channelType === ChannelType.PUBLIC}
              handleChange={handleChange}
            />
            <RadioButton
              name="option"
              value={ChannelType.PRIVATE}
              label="Private"
              isChecked={channelType === ChannelType.PRIVATE}
              handleChange={handleChange}
            />
            <RadioButton
              name="option"
              value={ChannelType.PROTECTED}
              label="Protected"
              isChecked={channelType === ChannelType.PROTECTED}
              handleChange={handleChange}
            />
            <div
              className={
                channelType === ChannelType.PROTECTED
                  ? "password-open"
                  : "password-close"
              }
            >
              <img
                className="password-icon"
                alt="password-icon"
                src="/icons/modal/password.svg"
              />
              <input
                className="password-input"
                type="password"
                maxLength={4}
                value={password}
                onChange={handleUserInputChange}
                placeholder={"password"}
              />
            </div>
          </div>
        </div>

        {/* show or not */}
        <div
          className={
            channelType === ChannelType.PROTECTED ? "protected-open" : "protected-close"
          }
        >
          <div className="protected-description">{descriptionText}</div>
          <div className="protected-error">{errorText}</div>
        </div>

        <div className="submit-wrap">
          <div className="submit" onClick={handleSubmitEvent}>
            <div className="submit-title">{buttonTitle}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChannelCreateModal;
