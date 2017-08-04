"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function() {
    function sliceIterator(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;
        try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);
                if (i && _arr.length === i) break;
            }
        } catch (err) {
            _d = true;
            _e = err;
        } finally {
            try {
                if (!_n && _i["return"]) _i["return"]();
            } finally {
                if (_d) throw _e;
            }
        }
        return _arr;
    }
    return function(arr, i) {
        if (Array.isArray(arr)) {
            return arr;
        } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
        } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
    };
}();

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

var _raf = require("raf");

var _raf2 = _interopRequireDefault(_raf);

var _springs = require("springs");

var _springs2 = _interopRequireDefault(_springs);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}

function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
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

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var snap = _popmotion.transform.snap;

var tension = 240;

var friction = 20;

var dragTension = 1e3;

var dragFriction = 30;

var Gleis = function() {
    function Gleis(_ref) {
        var _this = this;
        var draggedElement = _ref.draggedElement, wagonElements = _ref.wagonElements, trackElement = _ref.trackElement, _ref$bounds = _slicedToArray(_ref.bounds, 2), boundStart = _ref$bounds[0], boundEnd = _ref$bounds[1], sleepersAt = _ref.sleepersAt, _ref$reversed = _ref.reversed, reversed = _ref$reversed === undefined ? false : _ref$reversed, _ref$horizontal = _ref.horizontal, horizontal = _ref$horizontal === undefined ? true : _ref$horizontal;
        _classCallCheck(this, Gleis);
        this.horizontal = horizontal;
        this.horizontal = horizontal;
        this.draggedElement = draggedElement;
        this.reversed = reversed;
        this.start = boundStart || 0;
        this.end = boundEnd || this.getElementSize([ trackElement ])[0];
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
        this.draggedCss = (0, _popmotion.css)(draggedElement);
        trackElement.addEventListener("mousedown", this.onMousedown.bind(this));
        trackElement.addEventListener("touchstart", this.onMousedown.bind(this));
        this.loop();
        this.spring = (0, _springs2.default)(tension, friction, {
            onInit: function onInit(Spring) {
                _this.Spring = Spring;
            }
        });
    }
    _createClass(Gleis, [ {
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
        key: "onMousedown",
        value: function onMousedown(e) {
            var _this2 = this;
            this.pointerTracker = (0, _popmotion.pointer)(e).start();
            this.xOffset = (0, _popmotion.trackOffset)(this.pointerTracker.x, {
                from: this.draggedCss.get("x"),
                onUpdate: function onUpdate(x) {
                    _this2.position = x;
                }
            }).start();
            this.Spring.setSpringConfig({
                tension: dragTension,
                friction: dragFriction
            });
            window.addEventListener("mouseup", this.onMouseup.bind(this));
            window.addEventListener("touchend", this.onMouseup.bind(this));
        }
    }, {
        key: "onMouseup",
        value: function onMouseup() {
            var mouseVelocity = this.pointerTracker.getVelocity().x / 20;
            if (this.pointerTracker) this.pointerTracker.stop();
            if (this.xOffset) this.xOffset.stop();
            this.Spring.setSpringConfig({
                tension: tension,
                friction: friction
            });
            this.Spring.setVelocity(mouseVelocity);
            this.position = this.position + mouseVelocity;
            this.position = this.snap(this.position);
            window.removeEventListener("touchend", this.onMouseup.bind(this));
            window.removeEventListener("mouseup", this.onMouseup.bind(this));
        }
    }, {
        key: "applyForce",
        value: function applyForce(force) {
            this.velocityX += force;
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
        key: "update",
        value: function update() {
            var axis = this.horizontal ? "x" : "y";
            this.draggedCss.set(_defineProperty({}, axis, this.spring(this.position)));
        }
    }, {
        key: "loop",
        value: function loop() {
            var self = this;
            (0, _raf2.default)(function tick() {
                self.update();
                (0, _raf2.default)(tick);
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
            container.style = "\n      position: fixed;\n      bottom: 40px;\n      right: 40px;\n      width: " + this.end + "px;\n      height: " + (height - padding * 2) + "px;\n      background: rgba(0,0,0, .1);\n    ";
            var boundsStyle = "\n      position: absolute;\n      top: " + -padding + "px;\n      height: " + height + "px;\n      width: 0px;\n      border: 1px solid #333;\n    ";
            start.style = boundsStyle;
            end.style = boundsStyle;
            end.style.left = this.end + "px";
            this.sleepers.forEach(function(position) {
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