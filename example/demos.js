import { css, transform } from 'popmotion';
import Gleis from '../src';
import template from './template.html';

const { interpolate, clamp, pipe } = transform;

const root = document.getElementById('root');
const div = document.createElement('div');
div.innerHTML = template;
root.appendChild(div);

// Slider without snap.
new Gleis({
  train: root.querySelector('#train1'),
  track: root.querySelector('#track1'),
  reversed: true,
  snap: false,
  snapSettings: { scrollFriction: 0.2, friction: 0.8, spring: 200 },
});

// With snapping points.
new Gleis({
  train: root.querySelector('#train3'),
  track: root.querySelector('#track3'),
  reversed: true,
  snap: true,
  sleepers: [-200, -400, -600, -800, -1000, -1200, -1400, -1600],
});

// Centered bounds.
const box2CSS = css(root.querySelector('#car2'));

new Gleis({
  train: root.querySelector('#train2'),
  track: root.querySelector('#track2'),
  bounds: [400, -400],
  snapSettings: { scrollFriction: 0.4, friction: 0.9, spring: 900 },
  sleepers: [0],
  events: {
    onUpdate(progress) {
      box2CSS.set({
        opacity: interpolate([0, 0.3, 0.7, 1], [0, 1, 1, 0])(progress),
        y: interpolate([0, 0.5, 1], [100, 0, 100])(progress),
        rotateZ: interpolate([0, 1], [90, -90])(progress),
      });
    },
  },
});

// Centered bounds.
const icons = [...root.querySelectorAll('.icon')].map(x => css(x));
const scaleIcon = index => pipe(interpolate([0, 1], [-1, index]), clamp(0, 1));

new Gleis({
  train: root.querySelector('#train4'),
  track: root.querySelector('#track4'),
  sleepers: [0],
  bounds: [0, -500],
  snapSettings: { boundsElasticity: 1 },
  events: {
    onUpdate(progress) {
      icons.forEach((icon, index) => icon.set('scale', scaleIcon(index + 1)(progress)));
    },
  },
});
