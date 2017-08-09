import { css, pointer, value, physics, calc, transform } from 'popmotion';

const { pipe, conditional, interpolate, nonlinearSpring, add, subtract, snap } = transform;
const { getProgressFromValue } = calc;
const logger = (x) => {
  console.log(x);
  return x;
};
const sort = x => [...x].sort((a, b) => a > b);
const sortDesc = x => [...x].sort((a, b) => a < b);
const objectToBoundsKeys = (sleepers = {}, bounds = [0, 1]) =>
  Object.keys(sleepers).map(pipe(x => parseInt(x, 10), interpolate([0, 100], bounds)));

const SNAP_SETTINGS = { scrollFriction: 0.4, friction: 0.8, spring: 200, boundsElasticity: 4 };

// Create renderers
export default class Gleis {
  constructor({
    events = { onUpdate: null, onSnap: null },
    snapSettings = SNAP_SETTINGS,
    snap: widthSnap = true,
    sleepers = [],
    reversed = false,
    track,
    train,
    bounds,
  }) {
    // DOM elements.
    this.track = track;
    this.train = train;

    this.currentAction = null;
    this.events = events;

    this.snapSettings = Object.assign({}, SNAP_SETTINGS, snapSettings);
    this.snap = widthSnap;
    this.reversed = reversed;

    this.trainCSS = css(this.train);
    this.setOffset = x => this.currentOffset.set(x);
    this.getOffset = x => this.currentOffset.get(x);
    this.currentOffset = value(0, (x) => {
      if (typeof x !== 'number') return;
      this.onUpdate(x);
      this.trainCSS.set('x', x);
    });

    this.bounds = sortDesc(bounds || this.calcBounds());
    this.sleepers = sleepers || [];
    this.sleepersArray = Array.isArray(sleepers)
      ? sleepers
      : objectToBoundsKeys(this.sleepers, this.bounds);
    console.log('this.sleepersArray: ', this.sleepersArray);

    this.isOffLeft = x => x >= this.bounds[0];
    this.isOffRight = x => x <= this.bounds[1];

    this.track.addEventListener('mousedown', this.startDragging.bind(this), false);
    this.track.addEventListener('touchstart', this.startDragging.bind(this), false);
    window.addEventListener('mouseup', this.startScrolling.bind(this), false);
    window.addEventListener('touchend', this.startScrolling.bind(this), false);

    // window.addEventListener('resize', this.calcBounds.bind(this));
  }

  onUpdate(x) {
    this.progress = getProgressFromValue(...[...this.bounds, x]);

    if (!this.events.onUpdate) return x;

    // set progress between 0 and 1;
    this.events.onUpdate(this.progress, this);

    return x;
  }

  calcBounds() {
    const trainSize = this.train.clientWidth;
    const trackSize = this.track.clientWidth;

    this.bounds = [0, trainSize > trackSize ? trackSize - trainSize : 0];

    console.log('this.bounds: ', this.bounds);

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
        // Use the calculated value to set the offset

        this.setOffset,
      ),
    });
  }

  startScrolling(e) {
    e.preventDefault();

    const { scrollFriction, friction, spring } = this.snapSettings;

    const offset = this.getOffset();
    const snapTo = (x) => {
      if (!this.snap) {
        if (this.isOffLeft(x)) return this.bounds[0];
        if (this.isOffRight(x)) return this.bounds[1];

        return x;
      }

      const bounds = this.snap ? this.bounds : [];
      const snapPoints = sort([...bounds, ...this.sleepersArray]);

      const point = snap(snapPoints)(x);

      if (this.events.onSnap) this.events.onSnap(point);

      return point;
    };

    // If out of bounds, snap to the edges.
    if (this.isOffLeft(offset) || this.isOffRight(offset)) {
      this.startAction(
        physics({
          from: this.getOffset(),
          to: snapTo(this.getOffset()),
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
                (this.snap && Math.abs(this.currentOffset.getVelocity()) < 200),
              x =>
                this.startAction(
                  physics({
                    from: this.getOffset(),
                    to: snapTo(x),
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

  setSleepers(sleepers) {
    const result = [this.start, ...sleepers, this.end];

    if (this.reversed) {
      return result.map(sleeper => sleeper * -1);
    }

    result[result.length - 1] = this.end - this.getElementSize([this.draggedElement])[0];

    return result;
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
