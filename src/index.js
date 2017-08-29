import { css, pointer, value, physics, calc, transform } from 'popmotion';
import keyframe from 'keyframe';
import range from 'lodash.range';

const { pipe, conditional, nonlinearSpring, add, subtract, snap: snapFn } = transform;
const { getProgressFromValue } = calc;
const logger = x => x;
const sort = x => [...x].sort((a, b) => a - b);
const sortDesc = x => [...x].sort((a, b) => b - a);

const SNAP_SETTINGS = { scrollFriction: 0.4, friction: 0.8, spring: 200, boundsElasticity: 4 };

// Create renderers
export default class Gleis {
  constructor({
    events = { onUpdate: null, onSnap: null },
    snapSettings = SNAP_SETTINGS,
    snap,
    sleepers,
    setStyles = true,
    reversed = true,
    minVelocity = 200,
    track,
    train,
    bounds,
  }) {
    // DOM elements.
    this.track = track;
    this.train = train;
    this.setStyles = setStyles;
    this.reversed = reversed;
    this.minVelocity = minVelocity;

    this.currentAction = null;
    this.events = events;

    this.snapSettings = Object.assign({}, SNAP_SETTINGS, snapSettings);
    this.snap = snap === undefined && sleepers ? true : snap;
    this.sleeperIndex = 0;

    this.trainCSS = css(this.train);
    this.setOffset = x => this.currentOffset.set(x);
    this.getOffset = x => this.currentOffset.get(x);
    this.currentOffset = value(0, (x) => {
      if (typeof x !== 'number') return;
      if (this.setStyles) {
        this.trainCSS.set('x', x);
      }
      this.onUpdate(x);
    });

    this.bounds = sortDesc(bounds || this.calcBounds());
    this.sleepers = sleepers;
    this.sleepersArray = Array.isArray(sleepers) ? sleepers : this.generateSleepers(sleepers);

    if (this.reversed) {
      this.sleepersArray = this.sleepersArray.map(sleeper => sleeper * -1);
    }

    this.isOffLeft = x => x >= this.bounds[0];
    this.isOffRight = x => x <= this.bounds[1];

    this.currentOffset.set(0);

    this.startDragging = this.startDragging.bind(this);
    this.startScrolling = this.startScrolling.bind(this);
    this.track.addEventListener('mousedown', this.startDragging, false);
    this.track.addEventListener('touchstart', this.startDragging, false);

    // window.addEventListener('resize', this.calcBounds.bind(this));
  }

  onUpdate(x) {
    this.progress = getProgressFromValue(...[...this.bounds, x]);

    if (this.sleepersObject && this.progress >= 0 && this.progress <= 1) {
      keyframe(this.sleepersObject, this.progress);
    }

    if (!this.events.onUpdate) return x;

    // set progress between 0 and 1;
    this.events.onUpdate(this.progress, this);

    return x;
  }

  getBoundsWidth() {
    return this.bounds[0] + this.bounds[1];
  }

  generateSleepers(sleepersNumber = 0) {
    const width = this.getBoundsWidth() / sleepersNumber;

    return range(sleepersNumber).map((x, i) => width * -i);
  }

  calcBounds() {
    const trainSize = this.train.clientWidth;
    const trackSize = this.track.clientWidth;

    this.bounds = [0, trainSize > trackSize ? trackSize - trainSize : 0];

    return this.bounds;
  }

  // Prevent two competing actions.
  startAction(action) {
    if (this.currentAction) this.currentAction.stop();

    this.currentAction = action.start();
  }

  startDragging(e) {
    e.preventDefault();

    this.startAction(pointer(e));
    const pointerX = this.currentAction.x.get();
    this.currentAction.setProps({
      onUpdate: pipe(
        // Select the `x` pointer value
        ({ x }) => x,
        // Subtract the pointer origin to get the pointer offset
        // Apply the offset to the slider's origin offset
        add(this.getOffset()),
        subtract(pointerX),
        // Apply a spring if the slider is out of bounds.
        conditional(
          v => v > this.bounds[0],
          nonlinearSpring(this.snapSettings.boundsElasticity, this.bounds[0]),
        ),
        conditional(
          v => v < this.bounds[1],
          nonlinearSpring(this.snapSettings.boundsElasticity, this.bounds[1]),
        ),
        // Use the calculated value to set the offset.
        this.setOffset,
      ),
    });

    window.addEventListener('mouseup', this.startScrolling, false);
    window.addEventListener('touchend', this.startScrolling, false);
  }

  goTo(index) {
    const { friction, spring } = this.snapSettings;

    this.startAction(
      physics({
        from: this.getOffset(),
        to: this.snapTo(this.sleepersArray[index]),
        spring,
        friction,
        velocity: this.currentOffset.getVelocity(),
        onUpdate: pipe(this.setOffset),
      }),
    );
  }

  previous() {
    if (this.sleeperIndex <= 0) return;

    this.sleeperIndex = this.sleeperIndex - 1;

    this.goTo(this.sleeperIndex);
  }

  next() {
    if (this.sleeperIndex + 1 >= this.sleepersArray.length) return;

    this.sleeperIndex = this.sleeperIndex + 1;

    this.goTo(this.sleeperIndex);
  }

  snapTo(x) {
    if (!this.snap) {
      if (this.isOffLeft(x)) return this.bounds[0];
      if (this.isOffRight(x)) return this.bounds[1];

      return x;
    }

    const bounds = this.snap ? this.bounds : [];

    const snapPoints = sort([...bounds, ...this.sleepersArray]);

    const point = snapFn(snapPoints)(x);

    this.sleeperIndex = this.sleepersArray.indexOf(point);

    if (this.events.onSnap) this.events.onSnap(this.sleeperIndex, point);

    return point;
  }

  startScrolling(e) {
    e.preventDefault();

    window.removeEventListener('mouseup', this.startScrolling, false);
    window.removeEventListener('touchend', this.startScrolling, false);

    const { scrollFriction, friction, spring } = this.snapSettings;

    const offset = this.getOffset();

    // If out of bounds, snap to the edges.
    if (this.isOffLeft(offset) || this.isOffRight(offset)) {
      this.startAction(
        physics({
          from: this.getOffset(),
          to: this.snapTo(this.getOffset()),
          spring,
          friction,
          velocity: this.currentOffset.getVelocity(),
          onUpdate: pipe(this.setOffset),
        }),
      );
    } else {
      // Otherwise scroll with low friction.
      this.startAction(
        physics({
          from: this.getOffset(),
          friction: scrollFriction,
          velocity: this.currentOffset.getVelocity(),
          onUpdate: pipe(
            conditional(
              x =>
                this.isOffLeft(x) ||
                this.isOffRight(x) ||
                // Only snap with this spring when snap is activated and velocity is slow.
                (this.snap && Math.abs(this.currentOffset.getVelocity() / 2) < spring),
              x =>
                this.startAction(
                  physics({
                    from: this.getOffset(),
                    to: this.snapTo(x),
                    spring,
                    friction,
                    velocity: this.currentOffset.getVelocity(),
                    onUpdate: pipe(this.setOffset),
                  }),
                ),
            ),
            this.setOffset,
          ),
        }),
      );
    }
  }

  getElementSize(elements = []) {
    const size = this.horizontal ? 'width' : 'height';

    return [...elements].map(element => element.getBoundingClientRect()[size]);
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
    const width = this.bounds[this.bounds.length - 1] * -1;

    container.style = `
      position: fixed;
      bottom: 40px;
      right: 40px;
      width: ${width}px;
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
    end.style.left = `${width}px`;

    this.bounds.forEach((position) => {
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
