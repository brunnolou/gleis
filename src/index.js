import { transform, css, pointer, trackOffset } from 'popmotion';
import raf from 'raf';
import springs from 'springs';

const { snap } = transform;

const tension = 240;
const friction = 20;

const dragTension = 1000;
const dragFriction = 30;

/**
 * `Gleis`
 *
 * e.g.
 * options = {
 *  bounds: [0, 400],
 *  snap: int 100 | array [200, 250],
 * }
 */

export default class Gleis {
  constructor({
    draggedElement,
    wagonElements,
    trackElement,
    bounds: [boundStart, boundEnd],
    sleepersAt,
    reversed = false,
    horizontal = true,
  }) {
    this.horizontal = horizontal;
    this.horizontal = horizontal;
    this.draggedElement = draggedElement;
    this.reversed = reversed;
    this.start = boundStart || 0;
    this.end = boundEnd || this.getElementSize([trackElement])[0];
    this.sleepers = sleepersAt || this.getElementSize(wagonElements);

    this.sleepers = this.setSleepers(this.sleepers);

    this.snap = snap(this.sleepers);

    this.mousedownX = 0;
    this.dragStartPositionX = 0;
    this.positionX = 0;

    this.position = 0;

    this.isDragging = false;
    this.dragPositionX = this.positionX;
    this.restX = this.positionX;
    this.velocityX = 0;

    // Bind mouse down to track element.
    this.draggedCss = css(draggedElement);

    trackElement.addEventListener('mousedown', this.onMousedown.bind(this));
    trackElement.addEventListener('touchstart', this.onMousedown.bind(this));

    this.loop();

    this.spring = springs(tension, friction, {
      onInit: (Spring) => {
        this.Spring = Spring;
      },
    });
  }

  setSleepers(sleepers) {
    const result = [this.start, ...sleepers, this.end];

    if (this.reversed) {
      return result.map(sleeper => sleeper * -1);
    }

    result[result.length - 1] = this.end - this.getElementSize([this.draggedElement])[0];

    return result;
  }

  onMousedown(e) {
    this.pointerTracker = pointer(e).start();
    this.xOffset = trackOffset(this.pointerTracker.x, {
      from: this.draggedCss.get('x'),
      onUpdate: (x) => {
        this.position = x;
      },
    }).start();

    this.Spring.setSpringConfig({ tension: dragTension, friction: dragFriction });

    window.addEventListener('mouseup', this.onMouseup.bind(this));
    window.addEventListener('touchend', this.onMouseup.bind(this));
  }

  onMouseup() {
    const mouseVelocity = this.pointerTracker.getVelocity().x / 20;

    if (this.pointerTracker) this.pointerTracker.stop();
    if (this.xOffset) this.xOffset.stop();

    this.Spring.setSpringConfig({ tension, friction });
    this.Spring.setVelocity(mouseVelocity);

    this.position = this.position + mouseVelocity;
    this.position = this.snap(this.position);

    window.removeEventListener('touchend', this.onMouseup.bind(this));
    window.removeEventListener('mouseup', this.onMouseup.bind(this));
  }

  applyForce(force) {
    this.velocityX += force;
  }

  getElementSize(elements = []) {
    const size = this.horizontal ? 'width' : 'height';

    return [...elements].map(element => element.getBoundingClientRect()[size]);
  }

  update() {
    const axis = this.horizontal ? 'x' : 'y';

    // Add css to element.
    this.draggedCss.set({
      [axis]: this.spring(this.position),
    });
  }

  loop() {
    const self = this;

    raf(function tick() {
      self.update();
      raf(tick);
    });
  }

  /**
   * Debug render.
   */

  render() {
    const container = document.createElement('div');
    const start = document.createElement('div');
    const end = document.createElement('div');
    const height = 80;
    const padding = 20;

    container.style = `
      position: fixed;
      bottom: 40px;
      right: 40px;
      width: ${this.end}px;
      height: ${height - padding * 2}px;
      background: rgba(0,0,0, .1);
    `;
    const boundsStyle = `
      position: absolute;
      top: ${-padding}px;
      height: ${height}px;
      width: 0px;
      border: 1px solid #333;
    `;
    start.style = boundsStyle;
    end.style = boundsStyle;
    end.style.left = `${this.end}px`;

    this.sleepers.forEach((position) => {
      const dotted = document.createElement('div');

      dotted.style = `
        position: absolute;
        top: ${-padding}px;
        left: ${position}px;
        height: 80px;
        width: 0px;
        border: 1px dotted #999;
      `;

      container.appendChild(dotted);
    });

    container.appendChild(start);
    container.appendChild(end);
    document.body.appendChild(container);
  }
}
