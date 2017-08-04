import Gleis from "../src";
import './styles.css';
import template from './template.html';

var root = document.getElementById("root");
root.innerHTML = template;

const track = new Gleis({
	draggedElement: root.querySelector('#group1'),
	trackElement: root.querySelector('#track1'),
  bounds: [0],
  reversed: true,
  sleepersAt: [100, 200, 300, 400, 500, 600]
});

new Gleis({
	draggedElement: root.querySelector('#group2'),
	trackElement: root.querySelector('#track2'),
  bounds: [0],
  sleepersAt: [100, 200, 300, 400, 500, 600, 700, 800]
})
.render();;


