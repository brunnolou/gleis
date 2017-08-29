import Gleis from '../../src';
import html from './template.html';
import { addTemplate } from '../utils';

// Utility to add html string and get DOM elements.
const { train, track } = addTemplate({
  html,
  title: 'Hello word',
  description: 'Default values without sleepers / snap',
});

// Slider without sleepers/snap.
new Gleis({
  train,
  track,
});
