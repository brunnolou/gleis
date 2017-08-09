import { css, transform } from 'popmotion';
import './styles.css';
import Gleis from '../../src';
import template from './template.html';

const { interpolate, clamp, pipe } = transform;

const root = document.getElementById('root');
const div = document.createElement('div');
div.innerHTML = template;
root.appendChild(div);

// Slider without snap.
new Gleis({
  train: root.querySelector('#trainKeyframes'),
  track: root.querySelector('#trackKeyframes'),
  sleepers: {
    75: () => {},
    50: () => {},
    25: () => {},
  },
  snap: true,
  bounds: [-800, 0],
  snapSettings: { scrollFriction: 0.2, friction: 0.8, spring: 200 },
});
