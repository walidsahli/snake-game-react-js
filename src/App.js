import React from 'react';
import './style.css';

const size = { width: 40, height: 20 };

const map = Array(size.width)
  .fill(1)
  .map(() => Array(size.height).fill(0).slice());

const useOnNextTick = (cb, delay) => {
  console.log(delay);
  const id = React.useRef(null);
  React.useEffect(() => {
    if (id.current) {
      clearInterval(id.current);
    }
    id.current = setInterval(() => {
      cb();
    }, delay);
    return () => {
      clearInterval(id.current);
    };
  }, [delay]);
};

const useOnKeyPress = (cb) => {
  React.useEffect(() => {
    window.addEventListener('keydown', cb);
    return () => {
      window.removeEventListener('keydown', cb);
    };
  }, []);
};

const DESTINATION = [
  [-1, 0], // move left
  [0, -1], // move up
  [1, 0], // move right
  [0, 1], // move down
];

const isOutBound = (nextStep, size) => {
  return (
    nextStep[0] >= size.width ||
    nextStep[1] >= size.height ||
    nextStep[0] < 0 ||
    nextStep[1] < 0
  );
};

const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const generateRandomFoodPosition = (size) => {
  const position = [
    randomIntFromInterval(0, size.width - 1),
    randomIntFromInterval(0, size.height - 1),
  ];
  return position;
};

const generateFood = (snake, size) => {
  let position = generateRandomFoodPosition(size);
  if (
    snake.find((e) => {
      const [i, j] = e;
      return i === position[0] && j === position[1];
    })
  ) {
    return null;
  }
  return position;
};

const initialSnake = [
  [0, 0],
  [1, 0],
  [2, 0],
];

const SPEEDS = [500, 200, 70];

export default function App() {
  const [snake, setSnake] = React.useState(initialSnake.slice());
  const [_, setFood] = React.useState(null);
  const paused = React.useRef(true);
  const [isPaused, setIsPaused] = React.useState(false);
  const [speed, setSpeed] = React.useState(SPEEDS[0]);
  const nextDirection = React.useRef(2);
  const foodRef = React.useRef(null);

  useOnNextTick(() => {
    if (paused.current) {
      setIsPaused(true);
      return;
    }
    setIsPaused(false);
    const head = snake.at(-1);

    const step = DESTINATION[nextDirection.current];
    const next = [head[0] + step[0], head[1] + step[1]];
    if (isOutBound(next, size)) {
      // location.reload();
      return;
    }
    if (
      foodRef.current !== null &&
      next[0] === foodRef.current[0] &&
      next[1] === foodRef.current[1]
    ) {
      snake.push(foodRef.current);
      setSnake(snake.slice());
      foodRef.current = null;
      setFood(null);
    } else {
      snake.shift();
      snake.push(next);
      setSnake(snake.slice());
    }

    if (foodRef.current === null) {
      const position = generateFood(snake, size);
      if (position !== null) {
        foodRef.current = position;
      }
      setFood(position);
    }
  }, speed);

  useOnKeyPress(({ keyCode }) => {
    const code = keyCode - 37;
    if (code >= 4 || code < 0) {
      return;
    }
    nextDirection.current = code;
  });

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <h1>Your score is: {snake.length - initialSnake.length}</h1>
      <button
        onClick={() => {
          paused.current = !paused.current;
        }}
      >
        {isPaused ? 'play' : 'pause'}
      </button>
      <br />
      <h4>select speed</h4>
      <div style={{ display: 'flex' }}>
        {SPEEDS.map((_speed, index) => {
          return (
            <button
              onClick={() => {
                setSpeed(_speed);
              }}
            >
              {index}
            </button>
          );
        })}
      </div>
      <br />
      <br />
      <br />
      <div
        style={{
          display: 'flex',
          padding: 5,
        }}
      >
        {map.map((line, x) => {
          return (
            <div key={x + ''}>
              {line.map((_, y) => {
                let isFood =
                  foodRef.current !== null &&
                  foodRef.current?.[0] === x &&
                  foodRef.current?.[1] === y;

                if (isFood) {
                  return (
                    <div
                      id={'blink'}
                      style={{
                        height: 12,
                        width: 12,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'red',
                        borderRadius: 3,
                      }}
                    ></div>
                  );
                }

                const isSnakeBody = snake.find((e) => {
                  const [i, j] = e;
                  return i === x && j === y;
                });

                if (isSnakeBody) {
                  return (
                    <div
                      key={x + '_' + y}
                      style={{
                        height: 12,
                        width: 12,
                        background: 'rgba(1, 179, 1, 0.7)',
                        borderRadius: 3,
                      }}
                    ></div>
                  );
                }

                return (
                  <div
                    key={x + '_' + y}
                    style={{
                      height: 12,
                      width: 12,
                      background: 'rgba(0,0,0, 0.05)',
                      borderRadius: 0,
                    }}
                  ></div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
