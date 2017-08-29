import Gleis from '../../src';
import html from './template.html';
import { addTemplate } from '../utils';

// Utility to add html string and get DOM elements.
const { train, track } = addTemplate({
  html,
  title: 'With sleepers',
  description: 'Snaps to sleepers',
});

// Slider without sleepers/snap.
new Gleis({
  train,
  track,
  reversed: true,
  sleepers: [200, 400, 600],
});
