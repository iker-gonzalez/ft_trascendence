import GameSessionUser from '../interfaces/game-session-user.interface';
import UserData from '../interfaces/user-data.interface';
import {
  IBallData,
  INetData,
  ISounds,
  IUserData,
  RenderColor,
} from './game_pong.interfaces';
import hitSound from './sounds/hit.wav';
import wallSound from './sounds/punch.wav';
import userScoreSound from './sounds/strike.wav';
import botScoreSound from './sounds/goal.wav';
import BgImageGrass from './images/grass.jpg';
import { matchUser1, matchUser2, onGameEnd } from './game_pong.render';
import { Socket } from 'socket.io-client';
import { render } from './game_pong.render';

const ARROW_UP_KEY = 'ArrowUp';
const ARROW_DOWN_KEY = 'ArrowDown';

const ballTrail: any[] = [];

export function drawRect(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  color: RenderColor,
): void {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export function drawBall(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  r: number,
  color: RenderColor,
): void {
  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();

  ballTrail.push({ x: x, y: y, r: r });
}

export function drawBallTrail(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  if (!ctx) return;

  const lastBalls = ballTrail.slice(-40);

  lastBalls.forEach((ballTrail, index) => {
    const opacity = (index / lastBalls.length) * 0.4;
    const size = ballTrail.r * (index / lastBalls.length) * 0.9;

    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.globalAlpha = opacity;
    ctx.arc(ballTrail.x, ballTrail.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  });

  ctx.globalAlpha = 1;
}

export function drawDashedLine(canvas: HTMLCanvasElement, net: INetData): void {
  for (let i = 0; i <= canvas.height; i += net.width * 2) {
    drawRect(canvas, net.x, net.y + i, net.width, net.height, net.color);
  }
}

export function drawText(
  canvas: HTMLCanvasElement,
  text: string,
  x: number,
  y: number,
  font: string,
  align: CanvasTextAlign,
  color: RenderColor,
): void {
  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.font = font;
  ctx.fillText(text, x, y);
}

export function drawImg(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  if (!ctx) return;

  // So that background image is not render over the ball
  ctx.globalCompositeOperation = 'destination-over';
  ctx.drawImage(img, x, y, w, h);
  ctx.globalCompositeOperation = 'source-over';
}

export function checkCollision(b: IBallData, p: IUserData): boolean {
  b.top = b.y - b.radius;
  b.bottom = b.y + b.radius;
  b.left = b.x - b.radius;
  b.right = b.x + b.radius;

  p.top = p.y;
  p.bottom = p.y + p.height;
  p.left = p.x;
  p.right = p.x + p.width;

  return (
    p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top
  );
}

export function sparks(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  r: number,
  color: RenderColor,
) {
  
  let chispas = 20;

  for (let i = 0; i < chispas; i++) {
    let dx = Math.random() * 10 * r;
    let dy = Math.random() * 10 * r;
    drawBallTrail(canvas);
    drawBall(canvas, x + dx, y + dy, r , color);
    console.log("sparks", dx, dy);
  }
}

export function initializeSounds(): ISounds {
  let hit = new Audio(hitSound);
  let wall = new Audio(wallSound);
  let userScore = new Audio(userScoreSound);
  let botScore = new Audio(botScoreSound);

  return { hit, wall, userScore, botScore };
}

export function isSoloMode(usersData: {
  user1: GameSessionUser | UserData;
  user2?: GameSessionUser | UserData;
}): boolean {
  return !Boolean(usersData.user2);
}

export type InitializeCanvasImages = {
  canvasBgImage: HTMLImageElement;
};
export function initializeCanvasImages(): InitializeCanvasImages {
  const canvasBgImage: HTMLImageElement = new Image();
  canvasBgImage.src = BgImageGrass;

  return {
    canvasBgImage,
  };
}

export type InitializeEventListenersArgs = {
  canvas: HTMLCanvasElement;
  isPlayer1: boolean;
  user1: IUserData;
  userSpeedInput: number;
  usersData: {
    user1: GameSessionUser | UserData;
    user2?: GameSessionUser | UserData;
  };
  user2: IUserData;
  thickness: number;
  ballData: IBallData;
  slit: number;
};
export function initializeEventListeners({
  canvas,
  isPlayer1,
  user1,
  userSpeedInput,
  usersData,
  user2,
  thickness,
  ballData,
  slit,
}: InitializeEventListenersArgs): any[] {
  function onKeyDown(event: KeyboardEvent) {
    if (isPlayer1) {
      if (event.key === ARROW_UP_KEY) {
        user1.y -= userSpeedInput * 5;
      } else if (event.key === ARROW_DOWN_KEY) {
        user1.y += userSpeedInput * 5;
      }
    }

    if (!isPlayer1 && !isSoloMode(usersData)) {
      if (event.key === ARROW_UP_KEY) {
        user2.y -= userSpeedInput * 5;
      } else if (event.key === ARROW_DOWN_KEY) {
        user2.y += userSpeedInput * 5;
      }
    }
  }

  function onMouseMove(event: MouseEvent) {
    if (isPlayer1) {
      let rect = canvas.getBoundingClientRect();
      user1.y = event.clientY - rect.top - user1.height / 2;
      if (user1.y < thickness + ballData.radius * slit) {
        user1.y = thickness + ballData.radius * slit;
      } else if (
        user1.y >
        canvas.height - thickness - user1.height - ballData.radius * slit
      ) {
        user1.y =
          canvas.height - thickness - user1.height - ballData.radius * slit;
      }
    }
    if (!isPlayer1 && !isSoloMode(usersData)) {
      let rect = canvas.getBoundingClientRect();
      user2.y = event.clientY - rect.top - user2.height / 2;
      if (user2.y < thickness + ballData.radius * slit) {
        user2.y = thickness + ballData.radius * slit;
      } else if (
        user2.y >
        canvas.height - thickness - user1.height - ballData.radius * slit
      ) {
        user2.y =
          canvas.height - thickness - user1.height - ballData.radius * slit;
      }
    }
  }

  // function onTouchStart(event: TouchEvent) {
  //   const touch = event.touches[0];
  //   user1.y = touch.clientY - user1.height / 2;
  //   if (user1.y < thickness + ballData.radius * slit) {
  //     user1.y = thickness + ballData.radius * slit;
  //   } else if (
  //     user1.y >
  //     canvas.height - thickness - user1.height - ballData.radius * slit
  //   ) {
  //     user1.y =
  //       canvas.height - thickness - user1.height - ballData.radius * slit;
  //   }
  // }

  const eventList = [
    { typeEvent: 'keydown', handler: onKeyDown },
    { typeEvent: 'mousemove', handler: onMouseMove },
    // { typeEvent: 'touchstart', handler: onTouchStart },
  ];

  return eventList;
}

export type InitializeSocketLogicArgs = {
  socket: Socket;
  isPlayer1: boolean;
  sessionId: string;
  ballData: IBallData;
  user1: IUserData;
  user2: IUserData;
  matchPoints: number;
  matchFinish: boolean;
  usersData: {
    user1: GameSessionUser | UserData;
    user2?: GameSessionUser | UserData;
  };
  canvas: HTMLCanvasElement;
  eventList: any[];
  sounds: ISounds;
  net: INetData;
  canvasImages: InitializeCanvasImages;
  thickness: number;
};
export function initializeSocketLogic({
  socket,
  isPlayer1,
  sessionId,
  ballData,
  user1,
  user2,
  matchPoints,
  matchFinish,
  usersData,
  canvas,
  eventList,
  sounds,
  net,
  canvasImages,
  thickness,
}: InitializeSocketLogicArgs) {
  socket.emit(
    'upload',
    JSON.stringify({
      isUser1: isPlayer1,
      gameDataId: sessionId,
      ball: ballData,
      user1,
      user2,
    }),
  );

  if (isPlayer1) {
    socket.on(`downloaded/user1/${sessionId}`, (data: string) => {
      const downloadedData = JSON.parse(data);
      user2 = downloadedData.user2;

      if (user2.score >= matchPoints || user1.score >= matchPoints) {
        if (!matchFinish)
          onGameEnd(
            canvas,
            eventList,
            socket,
            sessionId,
            user1,
            usersData.user1,
          );
        matchFinish = true;
      }

      matchUser1(canvas, ballData, user1, user2, sounds);

      render(
        canvas,
        ballData,
        user1,
        user2,
        net,
        matchPoints,
        usersData,
        canvasImages,
        thickness,
      );

      socket.emit(
        'upload',
        JSON.stringify({
          isUser1: true,
          gameDataId: sessionId,
          ball: ballData,
          user1,
        }),
      );
    });
  } else {
    socket.on(`downloaded/user2/${sessionId}`, (data: string) => {
      const downloadedData = JSON.parse(data);
      ballData = downloadedData.ball;
      user1 = downloadedData.user1;

      if (user1.score >= matchPoints || user2.score >= matchPoints) {
        if (!matchFinish)
          onGameEnd(
            canvas,
            eventList,
            socket,
            sessionId,
            user2,
            usersData.user2,
          );
        matchFinish = true;
      }

      matchUser2(canvas, ballData, user1, user2, sounds);

      render(
        canvas,
        ballData,
        user1,
        user2,
        net,
        matchPoints,
        usersData,
        canvasImages,
        thickness,
      );

      socket.emit(
        'upload',
        JSON.stringify({ isUser1: false, gameDataId: sessionId, user2 }),
      );
    });
  }
}

export function onAbortGame(
  socket: Socket,
  sessionId: string,
  isPlayer1: boolean,
) {
  window.onunload = () => {
    socket.emit(
      'abort',
      JSON.stringify({ gameDataId: sessionId, isUser1: isPlayer1 }),
      () => {
        socket.disconnect();
      },
    );
  };
}
