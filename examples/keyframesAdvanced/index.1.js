import { css, transform } from 'popmotion';
import './styles.css';
import Gleis from '../../src';
import template from './template.html';

const { interpolate } = transform;

const root = document.getElementById('root');
const div = document.createElement('div');
div.innerHTML = template;
root.appendChild(div);

const cars = [...root.querySelectorAll('.car')].map(x => css(x));

const rotate = interpolate([0, 1], [0, -360]);

const train = root.querySelector('#trainKeyframes');
const track = root.querySelector('#trackKeyframes');

cars.forEach((car, i) =>
  car.set({
    rotateY: i * 360 / cars.length,
    translateZ: 200,
  }),
);

// Slider without snap.
new Gleis({
  train,
  track,
  sleepers: [{-200, -400, -600}],
  // sleepers: [-200, -400, -600],
  setStyles: false,
  bounds: [-800, 0],
  snap: true,
  snapSettings: { scrollFriction: 0.2, friction: 0.8, spring: 200 },
  events: {
    onUpdate(progress, gleis) {
      gleis.trainCSS.set({
        translateX: 0,
        rotateY: rotate(progress),
        scaleX: 0.6,
        scaleY: 0.6,
        scaleZ: 0.6,
      });
    },
    onSnap: console.info,
  },
});
