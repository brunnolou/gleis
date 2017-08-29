import keyframe from 'keyframe';
import { calc } from 'popmotion';

import './styles.css';
import Gleis from '../../src';
import html from './template.html';
import { addTemplate } from '../utils';

const { getValueFromProgress } = calc;

const { root, train, track, cars } = addTemplate({
  html,
  title: 'Translate Z + blur',
  description: `Use progress to move train Z instead o X. <br />
    Uses <a href="https://github.com/brunnolou/keyframe" target="_blank">keyframe</a>
    to move left each car.`,
});

const width = 100;

const moveX = (car, index) => (progress) => {
  // For each frame size will be between 0.7 and 1.
  const x = getValueFromProgress(0, -200, progress);
  const opacity = getValueFromProgress(0, 2, progress);

  car.style.filter = `blur(${opacity}px)`;
  car.style.transform = `translateX(${x}px) translateZ(${index * -width}px)`;
};

const moveZ = car => (progress) => {
  // For each frame size will be between 0.7 and 1.
  const x = getValueFromProgress(0, cars.length * width, progress);

  car.style.transform = `translateZ(${x}px)`;
};

// Create an keyframe object of { frame: (x) => scale(car)(x) }
const runFrames = keyframe({
  25: moveX(cars[0], 0),
  50: moveX(cars[1], 1),
  75: moveX(cars[2], 2),
  100: moveX(cars[3], 3),
});

// Know more about `keyframe` in: https://github.com/brunnolou/keyframe
const onUpdate = (progress) => {
  // Move train Z.
  moveZ(train)(progress);

  // Remove each car.
  runFrames(progress);
};

// Slider without snap.
new Gleis({
  train,
  track,
  snap: true,
  // Number of sleeps will be the total count of cars.
  sleepers: cars.length,
  // Since we want scroll left the bounds is negative.
  bounds: [-800, 0],
  // Disable train set styles, so the we can update the Z without moving.
  setStyles: false,
  snapSettings: { scrollFriction: 0.4, friction: 0.9 },
  events: {
    onUpdate,
  },
});
