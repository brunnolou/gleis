# Gleis
[![npm version](https://badge.fury.io/js/gleis.svg)](https://badge.fury.io/js/gleis)
![](https://david-dm.org/brunnolou/gleis.svg)
![](https://img.shields.io/github/size/brunnolou/gleis/lib/index.min.js.svg)

# Physics for dragging UI animation

## Install
`npm install gleis`

## Usage
```html
<div class="track">
  <div class="train">
    <div class="car">0</div>
    <div class="car">1</div>
    <div class="car">2</div>
    <div class="car">3</div>
  </div>
</div>
```

```js
import Gleis from 'gleis';

new Gleis({
  track: document.querySelector('.track'),
  train: document.querySelector('.train'),
  sleepers: [-200, —400, -600]
});

```
See the <a href="https://brunnolou.github.io/gleis/">Demos</a>.

To see more code implementations check the
<a href="https://github.com/brunnolou/gleis/tree/master/examples" target="_blank">examples folder</a>.

## Demo

`npm install`

`npm start`

`./examples/` folder will be running on: `http://localhost:5000`
