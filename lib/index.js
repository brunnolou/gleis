"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

var _popmotion = require("popmotion");

var _keyframe = require("keyframe");

var _keyframe2 = _interopRequireDefault(_keyframe);

var _lodash = require("lodash.range");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
        }
        return arr2;
    } else {
        return Array.from(arr);
    }
}

var pipe = _popmotion.transform.pipe, conditional = _popmotion.transform.conditional, interpolate = _popmotion.transform.interpolate, nonlinearSpring = _popmotion.transform.nonlinearSpring, add = _popmotion.transform.add, subtract = _popmotion.transform.subtract, snap = _popmotion.transform.snap;

var getProgressFromValue = _popmotion.calc.getProgressFromValue;

var logger = function logger(x) {
    return x;
};

var sort = function sort(x) {
    return [].concat(_toConsumableArray(x)).sort(function(a, b) {
        return a - b;
    });
};

var sortDesc = function sortDesc(x) {
    return [].concat(_toConsumableArray(x)).sort(function(a, b) {
        return b - a;
    });
};

var SNAP_SETTINGS = {
    scrollFriction: .4,
    friction: .8,
    spring: 200,
    boundsElasticity: 4
};

var Gleis = function() {
    function Gleis(_ref) {
        var _this = this;
        var _ref$events = _ref.events, events = _ref$events === undefined ? {
            onUpdate: null,
            onSnap: null
        } : _ref$events, _ref$snapSettings = _ref.snapSettings, snapSettings = _ref$snapSettings === undefined ? SNAP_SETTINGS : _ref$snapSettings, _ref$snap = _ref.snap, widthSnap = _ref$snap === undefined ? true : _ref$snap, _ref$sleepers = _ref.sleepers, sleepers = _ref$sleepers === undefined ? [] : _ref$sleepers, _ref$reversed = _ref.reversed, reversed = _ref$reversed === undefined ? false : _ref$reversed, _ref$setStyles = _ref.setStyles, setStyles = _ref$setStyles === undefined ? true : _ref$setStyles, _ref$minVelocity = _ref.minVelocity, minVelocity = _ref$minVelocity === undefined ? 200 : _ref$minVelocity, track = _ref.track, train = _ref.train, bounds = _ref.bounds;
        _classCallCheck(this, Gleis);
        this.track = track;
        this.train = train;
        this.setStyles = setStyles;
        this.minVelocity = minVelocity;
        this.currentAction = null;
        this.events = events;
        this.snapSettings = Object.assign({}, SNAP_SETTINGS, snapSettings);
        this.snap = widthSnap;
        this.reversed = reversed;
        this.sleeperIndex = 0;
        this.trainCSS = (0, _popmotion.css)(this.train);
        this.setOffset = function(x) {
            return _this.currentOffset.set(x);
        };
        this.getOffset = function(x) {
            return _this.currentOffset.get(x);
        };
        this.currentOffset = (0, _popmotion.value)(0, function(x) {
            if (typeof x !== "number") return;
            if (_this.setStyles) {
                _this.trainCSS.set("x", x);
            }
            _this.onUpdate(x);
        });
        this.bounds = sortDesc(bounds || this.calcBounds());
        this.sleepers = sleepers || [];
        this.sleepersArray = Array.isArray(sleepers) ? sleepers : this.generateSleepers(sleepers);
        this.isOffLeft = function(x) {
            return x >= _this.bounds[0];
        };
        this.isOffRight = function(x) {
            return x <= _this.bounds[1];
        };
        this.currentOffset.set(0);
        this.track.addEventListener("mousedown", this.startDragging.bind(this), false);
        this.track.addEventListener("touchstart", this.startDragging.bind(this), false);
        window.addEventListener("mouseup", this.startScrolling.bind(this), false);
        window.addEventListener("touchend", this.startScrolling.bind(this), false);
    }
    _createClass(Gleis, [ {
        key: "onUpdate",
        value: function onUpdate(x) {
            this.progress = getProgressFromValue.apply(undefined, [].concat(_toConsumableArray(this.bounds), [ x ]));
            if (this.sleepersObject && this.progress >= 0 && this.progress <= 1) {
                (0, _keyframe2.default)(this.sleepersObject, this.progress);
            }
            if (!this.events.onUpdate) return x;
            this.events.onUpdate(this.progress, this);
            return x;
        }
    }, {
        key: "getBoundsWidth",
        value: function getBoundsWidth() {
            return this.bounds[0] + this.bounds[1];
        }
    }, {
        key: "generateSleepers",
        value: function generateSleepers() {
            var sleepersNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var width = this.getBoundsWidth() / sleepersNumber;
            console.log("this.bounds: ", this.bounds);
            console.log("width: ", width);
            return (0, _lodash2.default)(sleepersNumber).map(function(x, i) {
                return width * i;
            });
        }
    }, {
        key: "calcBounds",
        value: function calcBounds() {
            var trainSize = this.train.clientWidth;
            var trackSize = this.track.clientWidth;
            this.bounds = [ 0, trainSize > trackSize ? trackSize - trainSize : 0 ];
            return this.bounds;
        }
    }, {
        key: "startAction",
        value: function startAction(action) {
            if (this.currentAction) this.currentAction.stop();
            this.currentAction = action.start();
        }
    }, {
        key: "startDragging",
        value: function startDragging(e) {
            var _this2 = this;
            e.preventDefault();
            this.startAction((0, _popmotion.pointer)(e));
            var pointerX = this.currentAction.x.get();
            this.currentAction.setProps({
                onUpdate: pipe(function(_ref2) {
                    var x = _ref2.x;
                    return x;
                }, add(this.getOffset()), subtract(pointerX), conditional(function(v) {
                    return v > _this2.bounds[0];
                }, nonlinearSpring(this.snapSettings.boundsElasticity, this.bounds[0])), conditional(function(v) {
                    return v < _this2.bounds[1];
                }, nonlinearSpring(this.snapSettings.boundsElasticity, this.bounds[1])), this.setOffset)
            });
        }
    }, {
        key: "goTo",
        value: function goTo(index) {
            var _snapSettings = this.snapSettings, friction = _snapSettings.friction, spring = _snapSettings.spring;
            this.startAction((0, _popmotion.physics)({
                from: this.getOffset(),
                to: this.snapTo(this.sleepersArray[index]),
                spring: spring,
                friction: friction,
                velocity: this.currentOffset.getVelocity(),
                onUpdate: pipe(this.setOffset)
            }));
        }
    }, {
        key: "previous",
        value: function previous() {
            if (this.sleeperIndex <= 0) return;
            this.sleeperIndex = this.sleeperIndex - 1;
            this.goTo(this.sleeperIndex);
        }
    }, {
        key: "next",
        value: function next() {
            if (this.sleeperIndex + 1 >= this.sleepersArray.length) return;
            this.sleeperIndex = this.sleeperIndex + 1;
            this.goTo(this.sleeperIndex);
        }
    }, {
        key: "snapTo",
        value: function snapTo(x) {
            if (!this.snap) {
                if (this.isOffLeft(x)) return this.bounds[0];
                if (this.isOffRight(x)) return this.bounds[1];
                return x;
            }
            var bounds = this.snap ? this.bounds : [];
            var snapPoints = sort([].concat(_toConsumableArray(bounds), _toConsumableArray(this.sleepersArray)));
            var point = snap(snapPoints)(x);
            this.sleeperIndex = this.sleepersArray.indexOf(point);
            if (this.events.onSnap) this.events.onSnap(this.sleeperIndex, point);
            return point;
        }
    }, {
        key: "startScrolling",
        value: function startScrolling(e) {
            var _this3 = this;
            e.preventDefault();
            var _snapSettings2 = this.snapSettings, scrollFriction = _snapSettings2.scrollFriction, friction = _snapSettings2.friction, spring = _snapSettings2.spring;
            var offset = this.getOffset();
            if (this.isOffLeft(offset) || this.isOffRight(offset)) {
                this.startAction((0, _popmotion.physics)({
                    from: this.getOffset(),
                    to: this.snapTo(this.getOffset()),
                    spring: spring,
                    friction: friction,
                    velocity: this.currentOffset.getVelocity(),
                    onUpdate: pipe(this.setOffset)
                }));
            } else {
                this.startAction((0, _popmotion.physics)({
                    from: this.getOffset(),
                    friction: scrollFriction,
                    velocity: this.currentOffset.getVelocity(),
                    onUpdate: pipe(conditional(function(x) {
                        return _this3.isOffLeft(x) || _this3.isOffRight(x) || _this3.snap && Math.abs(_this3.currentOffset.getVelocity() / 2) < spring;
                    }, function(x) {
                        return _this3.startAction((0, _popmotion.physics)({
                            from: _this3.getOffset(),
                            to: _this3.snapTo(x),
                            spring: spring,
                            friction: friction,
                            velocity: _this3.currentOffset.getVelocity(),
                            onUpdate: pipe(_this3.setOffset)
                        }));
                    }), this.setOffset)
                }));
            }
        }
    }, {
        key: "setSleepers",
        value: function setSleepers(sleepers) {
            var result = [ this.start ].concat(_toConsumableArray(sleepers), [ this.end ]);
            if (this.reversed) {
                return result.map(function(sleeper) {
                    return sleeper * -1;
                });
            }
            result[result.length - 1] = this.end - this.getElementSize([ this.draggedElement ])[0];
            return result;
        }
    }, {
        key: "getElementSize",
        value: function getElementSize() {
            var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
            var size = this.horizontal ? "width" : "height";
            return [].concat(_toConsumableArray(elements)).map(function(element) {
                return element.getBoundingClientRect()[size];
            });
        }
    }, {
        key: "render",
        value: function render() {
            var container = document.createElement("div");
            var start = document.createElement("div");
            var end = document.createElement("div");
            var height = 80;
            var padding = 20;
            var width = this.bounds[this.bounds.length - 1] * -1;
            container.style = "\n      position: fixed;\n      bottom: 40px;\n      right: 40px;\n      width: " + width + "px;\n      height: " + (height - padding * 2) + "px;\n      background: rgba(0,0,0, .1);\n    ";
            var boundsStyle = "\n      position: absolute;\n      top: " + -padding + "px;\n      height: " + height + "px;\n      width: 0px;\n      border: 1px solid #333;\n    ";
            start.style = boundsStyle;
            end.style = boundsStyle;
            end.style.left = width + "px";
            this.bounds.forEach(function(position) {
                var dotted = document.createElement("div");
                dotted.style = "\n        position: absolute;\n        top: " + -padding + "px;\n        left: " + position + "px;\n        height: 80px;\n        width: 0px;\n        border: 1px dotted #999;\n      ";
                container.appendChild(dotted);
            });
            container.appendChild(start);
            container.appendChild(end);
            document.body.appendChild(container);
        }
    } ]);
    return Gleis;
}();

exports.default = Gleis;

"use strict";

"use strict";