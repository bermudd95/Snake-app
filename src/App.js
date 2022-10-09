import React from "react";
import "./SnakeGame.css";
import GameOver from "./GameOver.jsx";

class SnakeGame extends React.Component {
  constructor(props) {
    super(props);

    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.state = {
      width: 0,
      height: 0,
      blockWidth: 0,
      blockHeight: 0,
      gameLoopTimeout: 50,
      timeoutId: 0,
      startSnakeSize: 0,
      snake: [],
      apple: {},
      direction: "right",
      directionChanged: false,
      isGameOver: false,
      snakeColor: this.props.snakeColor || this.getRandomColor(),
      appleColor: this.props.appleColor || this.getRandomColor(),
      score: 0,
      highScore: Number(localStorage.getItem("snakeHighScore")) || 0,
      newHighScore: false,
    };
  }

  componentDidMount() {
    this.initGame();
    window.addEventListener("keydown", this.handleKeyDown);
    this.gameLoop();
  }

  initGame() {
    // Game size initialization
    let percentageWidth = this.props.percentageWidth || 40;
    let width =
      document.getElementById("GameBoard").parentElement.offsetWidth *
      (percentageWidth / 100);
    width -= width % 30;
    if (width < 30) width = 30;
    let height = (width / 3) * 2;
    let blockWidth = width / 30;
    let blockHeight = height / 20;

    // snake initialization
    let startSnakeSize = this.props.startSnakeSize || 6;
    let snake = [];
    let X = width / 2;
    let Y = height / 2;
    let snakeHead = { X: width / 2, Y: height / 2 };
    snake.push(snakeHead);
    for (let i = 1; i < startSnakeSize; i++) {
      X -= blockWidth;
      let snakePart = { X: X, Y: Y };
      snake.push(snakePart);
    }

    // apple position initialization
    let appleX =
      Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
      blockWidth;
    let appleY =
      Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
      blockHeight;
    while (appleY === snake[0].Y) {
      appleY =
        Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
        blockHeight;
    }

    this.setState({
      width,
      height,
      blockWidth,
      blockHeight,
      startSnakeSize,
      snake,
      apple: { X: appleX, Y: appleY },
    });
  }

  gameLoop() {
    let timeoutId = setTimeout(() => {
      if (!this.state.isGameOver) {
        this.moveSnake();
        this.tryToEatSnake();
        this.tryToEatApple();
        this.setState({ directionChanged: false });
      }

      this.gameLoop();
    }, this.state.gameLoopTimeout);

    this.setState({ timeoutId });
  }

  componentWillUnmount() {
    clearTimeout(this.state.timeoutId);
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  resetGame() {
    let width = this.state.width;
    let height = this.state.height;
    let blockWidth = this.state.blockWidth;
    let blockHeight = this.state.blockHeight;
    let apple = this.state.apple;

    // snake reset
    let snake = [];
    let X = width / 2;
    let Y = height / 2;
    let snakeHead = { X: width / 2, Y: height / 2 };
    snake.push(snakeHead);
    for (let i = 1; i < this.state.startSnakeSize; i++) {
      X -= blockWidth;
      let snakePart = { X: X, Y: Y };
      snake.push(snakePart);
    }

    // apple position reset
    apple.X =
      Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
      blockWidth;
    apple.Y =
      Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
      blockHeight;
    while (this.isAppleOnSnake(apple.X, apple.Y)) {
      apple.X =
        Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
        blockWidth;
      apple.Y =
        Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
        blockHeight;
    }

    this.setState({
      snake,
      apple,
      direction: "right",
      directionChanged: false,
      isGameOver: false,
      gameLoopTimeout: 50,
      snakeColor: this.getRandomColor(),
      appleColor: this.getRandomColor(),
      score: 0,
      newHighScore: false,
    });
  }

  getRandomColor() {
    let hexa = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) color += hexa[Math.floor(Math.random() * 16)];
    return color;
  }

  moveSnake() {
    let snake = this.state.snake;
    let previousPartX = this.state.snake[0].X;
    let previousPartY = this.state.snake[0].Y;
    let tmpPartX = previousPartX;
    let tmpPartY = previousPartY;
    this.moveHead();
    for (let i = 1; i < snake.length; i++) {
      tmpPartX = snake[i].X;
      tmpPartY = snake[i].Y;
      snake[i].X = previousPartX;
      snake[i].Y = previousPartY;
      previousPartX = tmpPartX;
      previousPartY = tmpPartY;
    }
    this.setState({ snake });
  }

  tryToEatApple() {
    let snake = this.state.snake;
    let apple = this.state.apple;

    // if the snake's head is on an apple
    if (snake[0].X === apple.X && snake[0].Y === apple.Y) {
      let width = this.state.width;
      let height = this.state.height;
      let blockWidth = this.state.blockWidth;
      let blockHeight = this.state.blockHeight;
      let newTail = { X: apple.X, Y: apple.Y };
      let highScore = this.state.highScore;
      let newHighScore = this.state.newHighScore;
      let gameLoopTimeout = this.state.gameLoopTimeout;

      // increase snake size
      snake.push(newTail);

      // create another apple
      apple.X =
        Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
        blockWidth;
      apple.Y =
        Math.floor(Math.random() * ((height - blockHeight) / blockHeight + 1)) *
        blockHeight;
      while (this.isAppleOnSnake(apple.X, apple.Y)) {
        apple.X =
          Math.floor(Math.random() * ((width - blockWidth) / blockWidth + 1)) *
          blockWidth;
        apple.Y =
          Math.floor(
            Math.random() * ((height - blockHeight) / blockHeight + 1)
          ) * blockHeight;
      }

      // increment high score if needed
      if (this.state.score === highScore) {
        highScore++;
        localStorage.setItem("snakeHighScore", highScore);
        newHighScore = true;
      }

      // decrease the game loop timeout
      if (gameLoopTimeout > 25) gameLoopTimeout -= 0.5;

      this.setState({
        snake,
        apple,
        score: this.state.score + 1,
        highScore,
        newHighScore,
        gameLoopTimeout,
      });
    }
  }

  tryToEatSnake() {
    let snake = this.state.snake;

    for (let i = 1; i < snake.length; i++) {
      if (snake[0].X === snake[i].X && snake[0].Y === snake[i].Y)
        this.setState({ isGameOver: true });
    }
  }

  isAppleOnSnake(appleX, appleY) {
    let snake = this.state.snake;
    for (let i = 0; i < snake.length; i++) {
      if (appleX === snake[i].X && appleY === snake[i].Y)
        return true;
    }
    return false;
  }

  moveHead() {
    switch (this.state.direction) {
      case "left":
        this.moveHeadLeft();
        break;
      case "up":
        this.moveHeadUp();
        break;
      case "right":
        this.moveHeadRight();
        break;
      default:
        this.moveHeadDown();
    }
  }

  moveHeadLeft() {
    let width = this.state.width;
    let blockWidth = this.state.blockWidth;
    let snake = this.state.snake;
    snake[0].X =
      snake[0].X <= 0 ? width - blockWidth : snake[0].X - blockWidth;
    this.setState({ snake });
  }

  moveHeadUp() {
    let height = this.state.height;
    let blockHeight = this.state.blockHeight;
    let snake = this.state.snake;
    snake[0].Y =
      snake[0].Y <= 0 ? height - blockHeight : snake[0].Y - blockHeight;
    this.setState({ snake });
  }

  moveHeadRight() {
    let width = this.state.width;
    let blockWidth = this.state.blockWidth;
    let snake = this.state.snake;
    snake[0].X =
      snake[0].X >= width - blockWidth ? 0 : snake[0].X + blockWidth;
    this.setState({ snake });
  }

  moveHeadDown() {
    let height = this.state.height;
    let blockHeight = this.state.blockHeight;
    let snake = this.state.snake;
    snake[0].Y =
      snake[0].Y >= height - blockHeight ? 0 : snake[0].Y + blockHeight;
    this.setState({ snake });
  }

  handleKeyDown(event) {
    // if spacebar is pressed to run a new game
    if (this.state.isGameOver && event.keyCode === 32) {
      this.resetGame();
      return;
    }

    if (this.state.directionChanged) return;

    switch (event.keyCode) {
      case 37:
      case 65:
        this.goLeft();
        break;
      case 38:
      case 87:
        this.goUp();
        break;
      case 39:
      case 68:
        this.goRight();
        break;
      case 40:
      case 83:
        this.goDown();
        break;
      default:
    }
    this.setState({ directionChanged: true });
  }

  goLeft() {
    let newDirection = this.state.direction === "right" ? "right" : "left";
    this.setState({ direction: newDirection });
  }

  goUp() {
    let newDirection = this.state.direction === "down" ? "down" : "up";
    this.setState({ direction: newDirection });
  }

  goRight() {
    let newDirection = this.state.direction === "left" ? "left" : "right";
    this.setState({ direction: newDirection });
  }

  goDown() {
    let newDirection = this.state.direction === "up" ? "up" : "down";
    this.setState({ direction: newDirection });
  }

  render() {
    // Game over
    if (this.state.isGameOver) {
      return (
        <GameOver
          width={this.state.width}
          height={this.state.height}
          highScore={this.state.highScore}
          newHighScore={this.state.newHighScore}
          score={this.state.score}
        />
      );
    }

    return (
      <body>
        <div className="title-container">
          <h1>
            Snake App
          </h1> 
        </div>
        <div
        id="GameBoard"
        style={{
          width: this.state.width,
          height: this.state.height,
          borderWidth: this.state.width / 50,
        }}
      >
        {this.state.snake.map((snakePart, index) => {
          return (
            <div
              key={index}
              className="Block"
              style={{
                width: this.state.blockWidth,
                height: this.state.blockHeight,
                left: snakePart.X,
                top: snakePart.Y,
                background: this.state.snakeColor,
              }}
            />
          );
        })}
        <div
          className="Block"
          style={{
            width: this.state.blockWidth,
            height: this.state.blockHeight,
            left: this.state.apple.X,
            top: this.state.apple.Y,
            background: this.state.appleColor,
          }}
        />
        <div id="Score" style={{ fontSize: this.state.width / 20 }}>
          HIGH-SCORE: {this.state.highScore}&ensp;&ensp;&ensp;&ensp;SCORE:{" "}
          {this.state.score}
        </div>
        </div>
        <div className="intructions-container">
          <p>
            To move, use the directional keys.
          </p>
          <p>
            Don't touch your tail or you will <span>die</span>!
          </p>
          
        </div>
        <div className="words-of-encouragement">
          <h2>
            Good Luck!
          </h2>
        </div>
      </body>
    );
  }
}

export default SnakeGame;
