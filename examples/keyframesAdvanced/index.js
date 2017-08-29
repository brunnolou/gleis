import keyframe from 'keyframe';
import { calc } from 'popmotion';

import Gleis from '../../src';
import html from './template.html';
import { addTemplate } from '../utils';

const { getValueFromProgress } = calc;

const { root, train, track, cars } = addTemplate({
  html,
  title: 'Keyframes',
  description: 'Scaling each frame between 0.7 and 1',
});

const scale = car => (progress) => {
  // For each frame size will be between 0.7 and 1.
  const size = getValueFromProgress(0.7, 1, progress);

  car.style.transform = `scale(${size})`;
};

// Create an keyframe object of { frame: (x) => scale(car)(x) }
const frames = cars.reduce((acc, car, index) => {
  acc[index / cars.length * 100] = scale(car);

  return acc;
}, {});

// Know more about `keyframe` in: https://github.com/brunnolou/keyframe
const onUpdate = keyframe(frames);

// Slider without snap.
const gleis = new Gleis({
  train,
  track,
  // Number of sleeps will be the total count of cars.
  sleepers: cars.length - 1,
  // Since we want scroll left the bounds is the train width + one car (so the last one is visible)
  bounds: [-train.clientWidth + cars[0].clientWidth, 0],
  snap: true,
  snapSettings: { scrollFriction: 0.2, friction: 0.9, spring: 80 },
  events: {
    onUpdate,
  },
});

cars.map((car, i) =>
  car.addEventListener('click', () => {
    gleis.goTo(i);
  }),
);
