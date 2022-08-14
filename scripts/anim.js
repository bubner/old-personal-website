(function () {
    let __get_scope_binding_0 = function (__selector) {
        let __captured;

        switch (__selector) {
            case 0:
                __captured = [0];
                break;
        }

        __scope_0[__selector] = __captured;
        return __captured;
    };

    let __scope_0 = new Array(1);

    let _$0 = this;

    let _U = function (out) {
        "use strict";

        out = out || {};

        for (let i = 1; i < arguments.length; i++) {
            let obj = arguments[i];
            if (!obj) continue;

            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'object') deepExtend(out[key], obj[key]); else out[key] = obj[key];
                }
            }
        }

        return out;
    };

    let _S = function (element, options) {
        "use strict";

        let canvasSupport = !!_T.createElement('canvas').getContext;
        let canvas;
        let ctx;
        let particles = [];
        let raf;
        let mouseX = 0;
        let mouseY = 0;
        let winW;
        let winH;
        let desktop = !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i);
        let orientationSupport = !!_W.DeviceOrientationEvent;
        let tiltX = 0;
        let pointerX;
        let pointerY;
        let tiltY = 0;
        let paused = false;
        options = _U({}, _W["particleground"].defaults, options);

        function init() {
            if (!canvasSupport) {
                return;
            }


            canvas = _T.createElement('canvas');
            canvas.className = 'pg-canvas';
            canvas.style.display = 'block';
            element.insertBefore(canvas, element.firstChild);
            ctx = canvas.getContext('2d');
            styleCanvas();

            let numParticles = Math.round(canvas.width * canvas.height / options.density);

            for (let i = 0; i < numParticles; i++) {
                let p = new Particle();
                p.setStackPos(i);
                particles.push(p);
            }

            ;

            _W.addEventListener('resize', function () {
                resizeHandler();
            }, false);

            _T.addEventListener('mousemove', function (e) {
                mouseX = e.pageX;
                mouseY = e.pageY;
            }, false);

            if (orientationSupport && !desktop) {
                _W.addEventListener('deviceorientation', function () {
                    tiltY = Math.min(Math.max(-event.beta, -30), 30);
                    tiltX = Math.min(Math.max(-event.gamma, -30), 30);
                }, true);
            }

            draw();
            hook('onInit');
        }

        function styleCanvas() {
            canvas.width = element.offsetWidth;
            canvas.height = element.offsetHeight;
            ctx.fillStyle = options.dotColor;
            ctx.strokeStyle = options.lineColor;
            ctx.lineWidth = options.lineWidth;
        }

        function draw() {
            if (!canvasSupport) {
                return;
            }

            winW = _W.innerWidth;
            winH = _W.innerHeight;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].updatePosition();
            }

            for (let i = 0; i < particles.length; i++) {
                particles[i].draw();
            }

            if (!paused) {
                raf = requestAnimationFrame(draw);
            }
        }


        function resizeHandler() {
            styleCanvas();
            let elWidth = element.offsetWidth;
            let elHeight = element.offsetHeight;

            for (let i = particles.length - 1; i >= 0; i--) {
                if (particles[i].position.x > elWidth || particles[i].position.y > elHeight) {
                    particles.splice(i, 1);
                }
            }

            let numParticles = Math.round(canvas.width * canvas.height / options.density);

            if (numParticles > particles.length) {
                while (numParticles > particles.length) {
                    let p = new Particle();
                    particles.push(p);
                }
            } else if (numParticles < particles.length) {
                particles.splice(numParticles);
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].setStackPos(i);
            }

            ;
        }
        function pause() {
            paused = true;
        }

        function start() {
            paused = false;
            draw();
        }

        class Particle {
            constructor() {
                this.stackPos;
                this.active = true;
                this.layer = Math.ceil(Math.random() * 3);
                this.parallaxOffsetX = 0;
                this.parallaxOffsetY = 0;

                this.position = {
                    x: Math.ceil(Math.random() * canvas.width),
                    y: Math.ceil(Math.random() * canvas.height)
                };
                this.speed = {};

                switch (options.directionX) {
                    case 'left':
                        this.speed.x = +(-options.maxSpeedX + Math.random() * options.maxSpeedX - options.minSpeedX).toFixed(2);
                        break;

                    case 'right':
                        this.speed.x = +(Math.random() * options.maxSpeedX + options.minSpeedX).toFixed(2);
                        break;

                    default:
                        this.speed.x = +(-options.maxSpeedX / 2 + Math.random() * options.maxSpeedX).toFixed(2);
                        this.speed.x += this.speed.x > 0 ? options.minSpeedX : -options.minSpeedX;
                        break;
                }

                switch (options.directionY) {
                    case 'up':
                        this.speed.y = +(-options.maxSpeedY + Math.random() * options.maxSpeedY - options.minSpeedY).toFixed(2);
                        break;

                    case 'down':
                        this.speed.y = +(Math.random() * options.maxSpeedY + options.minSpeedY).toFixed(2);
                        break;

                    default:
                        this.speed.y = +(-options.maxSpeedY / 2 + Math.random() * options.maxSpeedY).toFixed(2);
                        this.speed.x += this.speed.y > 0 ? options.minSpeedY : -options.minSpeedY;
                        break;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.position.x + this.parallaxOffsetX, this.position.y + this.parallaxOffsetY, options.particleRadius / 2, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();

                for (let i = particles.length - 1; i > this.stackPos; i--) {
                    let p2 = particles[i];

                    let a = this.position.x - p2.position.x;
                    let b = this.position.y - p2.position.y;
                    let dist = Math.sqrt(a * a + b * b).toFixed(2);

                    if (dist < options.proximity) {
                        ctx.moveTo(this.position.x + this.parallaxOffsetX, this.position.y + this.parallaxOffsetY);

                        if (options.curvedLines) {
                            ctx.quadraticCurveTo(Math.max(p2.position.x, p2.position.x), Math.min(p2.position.y, p2.position.y), p2.position.x + p2.parallaxOffsetX, p2.position.y + p2.parallaxOffsetY);
                        } else {
                            ctx.lineTo(p2.position.x + p2.parallaxOffsetX, p2.position.y + p2.parallaxOffsetY);
                        }
                    }
                }

                ctx.stroke();
                ctx.closePath();
            }

            updatePosition() {
                if (options.parallax) {
                    if (orientationSupport && !desktop) {
                        let ratioX = (winW - 0) / (30 - -30);
                        pointerX = (tiltX - -30) * ratioX + 0;

                        let ratioY = (winH - 0) / (30 - -30);
                        pointerY = (tiltY - -30) * ratioY + 0;
                    } else {
                        pointerX = mouseX;
                        pointerY = mouseY;
                    }

                    this.parallaxTargX = (pointerX - winW / 2) / (options.parallaxMultiplier * this.layer);
                    this.parallaxOffsetX += (this.parallaxTargX - this.parallaxOffsetX) / 10;

                    this.parallaxTargY = (pointerY - winH / 2) / (options.parallaxMultiplier * this.layer);
                    this.parallaxOffsetY += (this.parallaxTargY - this.parallaxOffsetY) / 10;
                }

                let elWidth = element.offsetWidth;
                let elHeight = element.offsetHeight;

                switch (options.directionX) {
                    case 'left':
                        if (this.position.x + this.speed.x + this.parallaxOffsetX < 0) {
                            this.position.x = elWidth - this.parallaxOffsetX;
                        }

                        break;

                    case 'right':
                        if (this.position.x + this.speed.x + this.parallaxOffsetX > elWidth) {
                            this.position.x = 0 - this.parallaxOffsetX;
                        }

                        break;

                    default:
                        if (this.position.x + this.speed.x + this.parallaxOffsetX > elWidth || this.position.x + this.speed.x + this.parallaxOffsetX < 0) {
                            this.speed.x = -this.speed.x;
                        }

                        break;
                }

                switch (options.directionY) {
                    case 'up':
                        if (this.position.y + this.speed.y + this.parallaxOffsetY < 0) {
                            this.position.y = elHeight - this.parallaxOffsetY;
                        }

                        break;

                    case 'down':
                        if (this.position.y + this.speed.y + this.parallaxOffsetY > elHeight) {
                            this.position.y = 0 - this.parallaxOffsetY;
                        }

                        break;

                    default:
                        if (this.position.y + this.speed.y + this.parallaxOffsetY > elHeight || this.position.y + this.speed.y + this.parallaxOffsetY < 0) {
                            this.speed.y = -this.speed.y;
                        }

                        break;
                }


                this.position.x += this.speed.x;
                this.position.y += this.speed.y;
            }

            setStackPos(i) {
                this.stackPos = i;
            }
        }

        function option(key, val) {
            if (val) {
                options[key] = val;
            } else {
                return options[key];
            }
        }

        function destroy() {
            console.log('destroy');
            canvas.parentNode.removeChild(canvas);
            hook('onDestroy');
            ;
        }

        function hook(hookName) {
            if (options[hookName] !== undefined) {
                options[hookName].call(element);
            }
        }

        init();
        return {
            option: option,
            destroy: destroy,
            start: start,
            pause: pause
        };
    };

    class _6 {
        constructor(elem, options) {
            "use strict";
            return new _S(elem, options);
        }
    }

    let _P = function () {
        "use strict";
    };

    let _Q = function () {
        "use strict";
    };

    let _N = function (callback, element) {
        let __captured__scope_1 = __scope_0[0] || __get_scope_binding_0(0);

        let currTime = new Date().getTime();
        let timeToCall = Math.max(0, 16 - (currTime - __captured__scope_1[0]));
        let id = window.setTimeout(function () {
            callback(currTime + timeToCall);
        }, timeToCall);
        __captured__scope_1[0] = currTime + timeToCall;
        return id;
    };

    let _O = function (id) {
        clearTimeout(id);
    };

    let _T = document;
    let _W = _$0;
    _6.defaults = {
        minSpeedX: 0.1,
        maxSpeedX: 0.7,
        minSpeedY: 0.1,
        maxSpeedY: 0.7,
        directionX: "center",
        directionY: "center",
        density: 10000,
        dotColor: "#ed1c24",
        lineColor: "#f55860",
        particleRadius: 7,
        lineWidth: 1,
        curvedLines: false,
        proximity: 100,
        parallax: true,
        parallaxMultiplier: 5,
        onInit: _P,
        onDestroy: _Q
    };
    _$0.particleground = _6;
    _$0.requestAnimationFrame = void 0;
    _$0.cancelAnimationFrame = void 0;
    _$0.requestAnimationFrame = _N;
    _$0.cancelAnimationFrame = _O;
}).call(this);
