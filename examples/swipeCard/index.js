import { css, transform } from 'popmotion';
import Gleis from '../../src';
import html from './template.html';
import { addTemplate } from '../utils';

const { interpolate } = transform;

// Utility to add html string and get DOM elements.
const { train, track, cars: [car] } = addTemplate({
  html,
  title: 'Swipe Card',
  description: 'Center with CSS and custom interpolated progress',
});

// Centered bounds.
const carCSS = css(car);

new Gleis({
  train,
  track,
  bounds: [400, -400],
  sleepers: [0],
  snapSettings: { scrollFriction: 0.4, friction: 0.9, spring: 900 },
  events: {
    onUpdate(progress) {
      carCSS.set({
        opacity: interpolate([0, 0.5, 1], [0.2, 1, 0.2])(progress),
        rotateZ: interpolate([0, 1], [90, -90])(progress),
      });
    },
  },
});
