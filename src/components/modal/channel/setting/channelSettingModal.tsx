import axios from "axios";
import React, { useEffect, useState } from "react";
import RadioButton from "../../../button/radio/radio";
import { ChannelCreateDto, ChannelType } from "../create/channelCreateModal";
import "./channelSettingModal.scss";

type ChannelSettingModalProps = {
  open: boolean;
  close: any;
  channelId: number;
};

const ChannelSettingModal = (prop: ChannelSettingModalProps) => {
  const modalTitle = "채팅방 설정";
  const Description = "채팅방 설정을 변경해보세요.";

  const roomPlaceholder = "방 제목";
  const buttonTitle = "변경하기";

  const [title, setTitle] = useState("");
  const [channelType, setChannelType] = useState(ChannelType.PUBLIC);
  const [password, setPassword] = useState<string | undefined>(undefined);

  const [descriptionText, setDescriptionText] = useState(
    "비밀번호는 숫자 4자리로 구성 가능합니다."
  );
  const [errorText, setErrorText] = useState("");

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
    setTitle("");
    setChannelType(ChannelType.PUBLIC)
    setPassword("");
    setErrorText("");
    prop.close();
  };

  const handleSubmitEvent = async () => {
    const channelDto: ChannelCreateDto = {
      title: title,
      type: channelType,
      password: channelType == ChannelType.PROTECTED ? password : undefined,
    };

    if (title !== '' && (channelType == ChannelType.PROTECTED && password && password.length == 4 || channelType != ChannelType.PROTECTED)) {
      axios.put(`${process.env.REACT_APP_SERVER_ADDRESS}/channel/${prop.channelId}`, channelDto)
      .then(() => {
        prop.close();
      })
      .catch((e) => {
        console.log(e);
        setErrorText("권한이 없습니다");
      });
    }
  };

  const handleChange = (selectedType: ChannelType) => {
    setChannelType(selectedType);
    if (selectedType != ChannelType.PROTECTED) {
      setErrorText("");
      setPassword("");
    }
  };

  return (
    <div
      className={prop.open ? "modal-open modal-background" : "modal-background"}
    >
      <div className="channel-setting-modal-wrap">
        <div className="modal-header">
          <div className="title">{modalTitle}</div>
          <img
            className="close"
            src="/icons/modal/close.svg"
            onClick={handleClose}
          />
        </div>
        <div className="description">{Description}</div>

        <div className="content">
          <div className="subtitle">방 제목</div>
          {/* value={} onChage={}  */}
          <input
            className="roomTitle"
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
              <img className="password-icon" alt="password-icon" src="/icons/modal/password.svg"/>
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
        <div className={
          channelType !== ChannelType.PROTECTED ? "role-error": "protected-close"}>{errorText}</div>

        <div className="submit-wrap">
          <div className="submit" onClick={handleSubmitEvent}>
            <div className="submit-title">{buttonTitle}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChannelSettingModal;
