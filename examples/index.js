import './styles.css';
import { addTemplate } from './utils';

// Advanced.
addTemplate({
  description: `
    <h1>Simple <a href="https://github.com/brunnolou/gleis">Gleis</a> demos</h1>
    To see the code implementation check the
    <a href="https://github.com/brunnolou/gleis/tree/master/examples" target="_blank">examples folder</a>.<br><br>`,
});

// Simple.
require('./helloWorld');
require('./manualSleepers');
require('./swipeCard');
require('./revealIcons');

// Advanced.
addTemplate({
  description:
    '<h1>Advanced</h1>' +
    `Using <a href="https://github.com/brunnolou/keyframe" target="_blank">keyframe</a>
  To move each individual car in their on progress interval.<br><br>`,
});

require('./keyframes');
require('./keyframesAdvanced');
