import keyframe from 'keyframe';
import { calc } from 'popmotion';

import './styles.css';
import Gleis from '../../src';
import templateString from './template.html';
import { addTemplate } from '../utils';

const { getValueFromProgress } = calc;

const root = addTemplate(templateString, 'Keyframes', 'Use progress to move train Z instead o X. <br> Uses keyframe to remove left each box.');

const train = root.querySelector('#train3d');
const track = root.querySelector('#track3d');
const boxes = [...root.querySelectorAll('.box3d')];

const moveX = (box, index) => (progress) => {
  // For each frame size will be between 0.7 and 1.
  const x = getValueFromProgress(0, -200, progress);

  box.style.transform = `translateX(${x}px) translateZ(${index * -200}px)`;
};

const moveZ = box => (progress) => {
  // For each frame size will be between 0.7 and 1.
  const x = getValueFromProgress(0, 800, progress);

  box.style.transform = `translateZ(${x}px)`;
};

boxes.forEach((box, i) => moveZ(box, i / boxes.length));

// Create an keyframe object of { frame: (x) => scale(box)(x) }
const runFrames = keyframe({
  25: moveX(boxes[0], 0),
  50: moveX(boxes[1], 1),
  75: moveX(boxes[2], 2),
  100: moveX(boxes[3], 3),
});

// Now more about `keyframe` in: https://github.com/brunnolou/keyframe
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
  // Number of sleeps will be the total count of boxes.
  snap: true,
  sleepers: boxes.length,
  // Since we want scroll left the bounds is negative.
  bounds: [-800, 0],
  // Disable train set styles, so the we can update the Z without moving.
  setStyles: false,
  events: {
    onUpdate,
  },
});
