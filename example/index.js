import Gleis from "../src";
import "./styles.css";
import template from "./template.html";
import { css, transform } from "popmotion";

const { interpolate, clamp, pipe } = transform;

var root = document.getElementById("root");
root.innerHTML = template;

// Slider without snap.
new Gleis({
  train: root.querySelector("#train1"),
  track: root.querySelector("#track1"),
  snapToBounds: false,
  snapSettings: { scrollFriction: 0.1, friction: 0.8, spring: 200 },
  reversed: true
});

// With snapping points.
new Gleis({
  train: root.querySelector("#train3"),
  track: root.querySelector("#track3"),
  snapToBounds: true,
  reversed: true,
  sleepers: [-200, -400, -600, -800, -1000, -1200, -1400, -1600]
});

// Centered bounds.
const box2CSS = css(root.querySelector("#car2"));

new Gleis({
  train: root.querySelector("#train2"),
  track: root.querySelector("#track2"),
  bounds: [400, -400],
  snapSettings: { scrollFriction: 0.4, friction: 0.9, spring: 900 },
  sleepers: [0],
  events: {
    onUpdate(progress, gleis) {
      box2CSS.set({
        opacity: interpolate([0, 0.3, 0.7, 1], [0, 1, 1, 0])(progress),
        y: interpolate([0, 0.5, 1], [90, 0, 90])(progress),
        rotateZ: interpolate([0, 1], [90, -90])(progress)
      });
    }
  }
});

// Centered bounds.
const icons = [...root.querySelectorAll(".icon")].map(x => css(x));
const scaleIcon = index => pipe(interpolate([0, 1], [-3, index + 1]), clamp(0, 1));

new Gleis({
  train: root.querySelector("#train4"),
  track: root.querySelector("#track4"),
  bounds: [500, -500],
  // snapSettings: { scrollFriction: 0.4, friction: .9, spring: 900 },
  sleepers: [0],
  events: {
    onUpdate(progress, gleis) {
      icons.forEach((icon, index) => icon.set("scale", scaleIcon(index)(progress)));
    }
  }
});
