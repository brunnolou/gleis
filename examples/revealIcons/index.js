import { css, transform } from 'popmotion';
import Gleis from '../../src';
import html from './template.html';
import { addTemplate } from '../utils';

const { interpolate, clamp, pipe } = transform;

// Utility to add html string and get DOM elements.
const { train, track } = addTemplate({
  html,
  title: 'Reveal Icons',
  description: 'Use interpolated progress to scale each icon',
});

// Reveal Icons.
const icons = [...root.querySelectorAll('.icon')];
const iconsCSS = icons.map(x => css(x));
const scaleIcon = index => pipe(interpolate([0, 1], [-1, index]), clamp(0, 1));

new Gleis({
  train,
  track,
  sleepers: [0],
  bounds: [0, -500],
  snapSettings: { boundsElasticity: 1 },
  events: {
    onUpdate(progress) {
      iconsCSS.forEach((icon, index) => icon.set('scale', scaleIcon(index + 1)(progress)));
    },
  },
});
