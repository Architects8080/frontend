import React, { KeyboardEvent } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useHistory } from "react-router";
import GameResultModal from "../../../components/modal/game/gameResultModal";
import {
  score,
  winnerProfile,
} from "../../../components/modal/game/gameResultModalType";
import { io } from "../../../socket/socket";
import { GameInfo } from "../gameType";
import "./pong.css";

type PongProps = {
  gameId: string;
  gameInfo: GameInfo;
};

type GameoverInfo = {
  winnerProfile: winnerProfile;
  score: score;
};

const Pong = ({ gameId, gameInfo }: PongProps) => {
  const history = useHistory();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moveUpSpeed = -7;
  const moveDownSpeed = 7;

  const [gameoverInfo, setGameoverInfo] = useState({} as GameoverInfo);

  const [test, setTest] = useState(0);
  const time = useRef(0);

  const keyDownEvent = useCallback((e) => {
    //usememo 그대로 써서 cost

    e.preventDefault();
    e.target.focus({preventScroll: true});
    if (e.key === "ArrowUp" || e.key === "w") {
      io.emit("move", [gameId, moveUpSpeed]);
    }
    if (e.key === "ArrowDown" || e.key === "s") {
      io.emit("move", [gameId, moveDownSpeed]);
    }
  }, []);

  const ballRadius = 10;
  const paddleHeight = 75;
  const paddleWidth = 10;

  const obstacleWidth = 20;
  const obstacleHeight = 100; //canvas.height / 6;

  const [isGameOver, setIsGameOver] = useState(false);
  const closeGameInviteModal = () => {
    history.push(`/main`);
    setIsGameOver(false);
  };

  const background = new Image();
  background.src = gameInfo.mapImage;

  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const timer = setInterval(() => {
      draw();
      setTest((time.current += 1));
    }, 10);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      drawObstacle();
      drawball();
      drawpaddle();
    };

    const drawBackground = () => {
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    };

    const drawball = () => {
      ctx.beginPath();
      ctx.arc(
        gameInfo.ball.position.x,
        gameInfo.ball.position.y,
        ballRadius,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "#0095DD";
      ctx.fill();
      ctx.closePath();
    };

    const drawpaddle = () => {
      ctx.beginPath();
      ctx.rect(
        gameInfo.player1.position.x,
        gameInfo.player1.position.y,
        paddleWidth,
        paddleHeight
      );
      ctx.rect(
        gameInfo.player2.position.x,
        gameInfo.player2.position.y,
        paddleWidth,
        paddleHeight
      );
      ctx.fillStyle = "#0095DD";
      ctx.fill();
      ctx.closePath();
    };

    const drawObstacle = () => {
      ctx.beginPath();
      gameInfo.obstacles.forEach((element) => {
        ctx.rect(
          element.position.x,
          element.position.y,
          obstacleWidth,
          obstacleHeight
        );
      });
      ctx.fillStyle = "#FF5C5C";
      ctx.fill();
      ctx.closePath();
    };
    window.addEventListener("keydown", keyDownEvent);

    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", keyDownEvent);
    };
  }, [test]);

  useEffect(() => {
    io.on("gameover", (gameId: number, gameoverInfo: GameoverInfo) => {
      setGameoverInfo(gameoverInfo);
      setIsGameOver(true);
    });
  }, []);

  return (
    <>
      {isGameOver ? (
        <GameResultModal
          open={isGameOver}
          close={closeGameInviteModal}
          score={gameoverInfo.score}
          winnerProfile={gameoverInfo.winnerProfile}
        ></GameResultModal>
      ) : (
        ""
      )}
      <canvas ref={canvasRef} height={600} width={800} className="canvas" />
    </>
  );
}

export default Pong;
