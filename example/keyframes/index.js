import "./styles.css";
import Gleis from "../../src";
import template from "./template.html";
import { css, transform } from "popmotion";

const { interpolate, clamp, pipe } = transform;

const root = document.getElementById("root");
const div = document.createElement('div');
div.innerHTML = template;
root.appendChild(div);

// Slider without snap.
new Gleis({
  train: root.querySelector("#trainKeyframes"),
  track: root.querySelector("#trackKeyframes"),
  reversed: true,
  snap: false,
  snapSettings: { scrollFriction: 0.2, friction: 0.8, spring: 200 },
});
