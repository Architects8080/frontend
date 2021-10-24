import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import { io } from "../../../socket/socket";
import "./gameModal.scss";
import useDetectOutsideClick from "./useDetectOutsideClick";

type ModalProps = {
  open: boolean;
  close: any;
  targetId: number;
};

const GameSettingModal = (prop: ModalProps) => {
  const dropdownRef = useRef(null);
  const [isActive, setIsActive] = useDetectOutsideClick(dropdownRef, false);
  const [currentImageIdx, setcurrentImageIdx] = useState(0);

  const [isSelect, setIsSelect] = useState(false);
  const [buttonText, setButtonText] = useState("맵 선택");

  const [mapList, setMapList] = useState<string[]>([""]);
  var isChecked = false;

  const getMapList = async (): Promise<any> => {
    try {
      const data = await axios.get(
        process.env.REACT_APP_SERVER_ADDRESS + "/game/map/list"
      );
      setMapList(data.data);
    } catch (error) {
      
    }
  };

  useEffect(() => {
    setButtonText("맵 선택");
    setIsSelect(false);
    setcurrentImageIdx(0);
    getMapList();
  }, []);

  const onClick = (label: string) => {
    return (event: React.MouseEvent) => {
      setButtonText(label);
      if (label != "맵 선택") setIsSelect(true);
      setIsActive(!isActive);
      event.preventDefault();
    };
  };

  const handlePreviewEvent = (idx: number) => {
    return (event: React.MouseEvent) => {
      setcurrentImageIdx(idx);
      event.preventDefault();
    };
  };

  const handleRollBackEvent = () => {
    if (!isSelect) setcurrentImageIdx(0);
  };

  const handleChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    isChecked = e.target.checked;
  };

  const handleSubmit = (event: React.MouseEvent) => {
    io.emit("invite", prop.targetId, {
      mapId: currentImageIdx,
      isObstacle: isChecked,
    });
    prop.close();
  };

  return (
    <div className={prop.open ? "open-modal modal" : "modal"}>
      {prop.open ? (
        <section>
          <div className="modal-title">
            게임 설정
            <img
              className="close"
              alt="close"
              src="/icons/modal/close.svg"
              onClick={prop.close} />
          </div>
          <div className="description">
            커스텀 게임을 진행하기 전에 맵, 장애물 여부를 선택해주세요.
          </div>
          {/* 1번째 subtitle */}
          <div className="modal-content">
            <div className="title">맵 선택 & 미리보기</div>
            <img src={mapList[currentImageIdx]} className="preview-map"/>
          </div>

          {/* 2번째 subtitle */}
          <div className="modal-content">
            <div className="menu-container">
              <button onClick={onClick(buttonText)} className="menu-trigger">
                {buttonText}
              </button>
              <nav
                ref={dropdownRef}
                className={`menu ${isActive ? "active" : "inactive"}`}
              >
                <ul>
                  <li>
                    <a
                      href="#"
                      onMouseEnter={handlePreviewEvent(1)}
                      onMouseOut={handleRollBackEvent}
                      onClick={onClick("1972 pong")}
                    >
                      1972 pong
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onMouseEnter={handlePreviewEvent(2)}
                      onMouseOut={handleRollBackEvent}
                      onClick={onClick("인채가 만든맵")}
                    >
                      인채가 만든맵
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onMouseEnter={handlePreviewEvent(3)}
                      onMouseOut={handleRollBackEvent}
                      onClick={onClick("chlee가 만든맵")}
                    >
                      chlee가 만든맵
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
            {/* {children} */}
          </div>

          {/* 3번째 subtitle */}
          <div className="modal-content">
            <div className="title">장애물 여부</div>
            <input type="checkbox" id="obstacle" onChange={handleChangeEvent} />
          </div>
          <div className="game-setting-submit">
            <button className="close" onClick={handleSubmit}>
              {" "}
              submit
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default GameSettingModal;
