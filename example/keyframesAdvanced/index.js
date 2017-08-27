import keyframe from 'keyframe';
import { calc } from 'popmotion';

import Gleis from '../../src';
import templateString from './template.html';
import { addTemplate } from '../utils';

const { getValueFromProgress } = calc;

const root = addTemplate(templateString, 'Keyframes', 'Scaling each frame between 0.7 and 1');

const train = root.querySelector('#trainKeyframes');
const track = root.querySelector('#trackKeyframes');

const boxes = [...root.querySelectorAll('.boxKeyframe')];

const scale = box => (progress) => {
  // For each frame size will be between 0.7 and 1.
  const size = getValueFromProgress(0.7, 1, progress);

  box.style.transform = `scale(${size})`;
};

// Create an keyframe object of { frame: (x) => scale(box)(x) }
const frames = boxes.reduce((acc, box, index) => {
  acc[index / boxes.length * 100] = scale(box);

  return acc;
}, {});

// Now more about `keyframe` in: https://github.com/brunnolou/keyframe
const onUpdate = keyframe(frames);

// Slider without snap.
const gleis = new Gleis({
  train,
  track,
  // Number of sleeps will be the total count of boxes.
  sleepers: boxes.length - 1,
  // Since we want scroll left the bounds is the train width + one box (so the last one is visible)
  bounds: [-train.clientWidth + boxes[0].clientWidth, 0],
  snap: true,
  snapSettings: { scrollFriction: 0.2, friction: 0.9, spring: 80 },
  events: {
    onUpdate,
  },
});

boxes.map((box, i) =>
  box.addEventListener('click', () => {
    gleis.goTo(i);
  }),
);
