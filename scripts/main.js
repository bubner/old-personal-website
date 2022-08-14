document.addEventListener('DOMContentLoaded', (() => {
    new particleground(document.getElementById('animations'), {
        dotColor: '#ed1c24',
        lineColor: '#f55860'
    });
    let intro = document.getElementById('main_body');
    setTimeout(() => {
        intro.style.marginTop = -intro.offsetHeight / 2 + 'px';
    }, 100);
}), false);

class textSwitcher {
    constructor(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = "";
        this.tick();
        this.isDeleting = false;
    }
    tick() {
        let i = this.loopNum % this.toRotate.length;
        let fullTxt = this.toRotate[i];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.el.innerHTML = '<span class="wrap">' + this.txt + "</span>";

        let that = this;
        let delta = 200 - Math.random() * 100;

        if (this.isDeleting) {
            delta /= 2;
        }

        if (!this.isDeleting && this.txt === fullTxt) {
            delta = this.period;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === "") {
            this.isDeleting = false;
            this.loopNum++;
            delta = 500;
        }

        setTimeout((function () {
            that.tick();
        }), delta);
    }
}


window.onload = function () {
    let elements = document.getElementsByClassName("text-switcher");
    for (let i = 0; i < elements.length; i++) {
        let toRotate = elements[i].getAttribute("data-switch-content");
        let period = elements[i].getAttribute("data-hold-time");
        if (toRotate) {
            new textSwitcher(elements[i], JSON.parse(toRotate), period);
        }
    }

    let css = document.createElement("style");
    css.innerHTML = ".text-switcher > .wrap { border-right: 0.08em solid #666 }";
    document.body.appendChild(css);
};
