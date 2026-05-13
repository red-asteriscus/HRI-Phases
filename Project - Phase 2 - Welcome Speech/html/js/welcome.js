var phaseMap = {
    welcome: {
        title: "Welcome to USEK Graduation Ceremony 2026",
        label: "Welcome Ceremony",
        text: "Tap Pepper or choose a cue to test tablet interaction."
    },

    ready: {
        title: "Audience, are you ready to start?",
        label: "Readiness Check",
        text: "Guests can answer by voice or by tablet."
    },

    speech: {
        title: "Welcome to USEK Graduation Ceremony 2026",
        label: "Main Speech",
        text: "Pepper is speaking."
    }
};

function getUrlParam(param, defaultValue) {
    var query = window.location.search.substring(1);
    var pairs = query.split("&");

    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split("=");

        if (decodeURIComponent(pair[0]) === param) {
            return decodeURIComponent(pair[1] || "");
        }
    }

    return defaultValue;
}

function getCurrentPhase() {
    var phase = getUrlParam("phase", "welcome");

    if (!phaseMap[phase]) {
        phase = "welcome";
    }

    return phase;
}

function setText(id, value) {
    var element = document.getElementById(id);

    if (element) {
        element.innerHTML = value;
    }
}

function setDisplay(id, displayValue) {
    var element = document.getElementById(id);

    if (element) {
        element.style.display = displayValue;
    }
}

function addClass(element, className) {
    if (!element) {
        return;
    }

    if ((" " + element.className + " ").indexOf(" " + className + " ") === -1) {
        element.className = element.className + " " + className;
    }
}

function removeClass(element, className) {
    if (!element) {
        return;
    }

    element.className = (" " + element.className + " ")
        .replace(" " + className + " ", " ")
        .replace(/  +/g, " ")
        .replace(/^\s+|\s+$/g, "");
}

function renderPhase() {
    var phase = getCurrentPhase();
    var data = phaseMap[phase];
    var body = document.getElementsByTagName("body")[0];

    if (body) {
        body.className = "phase-" + phase;
    }

    setText("question-text", data.title);
    setText("intro-label", data.label);
    setText("phase-text", data.text);

    updatePhaseTrack(phase);
    updateVisibleControls(phase);

    if (phase === "speech") {
        makeConfetti(false);
    }
}

function updatePhaseTrack(currentPhase) {
    var phases = ["welcome", "ready", "speech"];

    for (var i = 0; i < phases.length; i++) {
        removeClass(document.getElementById("step-" + phases[i]), "active");
    }

    addClass(document.getElementById("step-" + currentPhase), "active");
}

function updateVisibleControls(phase) {
    setDisplay("group-yes-no", "none");
    setDisplay("cue-panel", "none");

    if (phase === "welcome") {
        setDisplay("cue-panel", "block");
    }

    if (phase === "ready") {
        setDisplay("group-yes-no", "block");
    }
}

function sendTabletEvent(eventName) {
    if (typeof QiSession === "undefined") {
        console.log("QiSession is not available. Could not send event:", eventName);
        return;
    }

    QiSession(function (session) {
        session.service("ALMemory").then(function (memory) {
            memory.raiseEvent(eventName, 1);
        }, function (error) {
            console.log("Could not access ALMemory:", error);
        });
    }, function () {
        console.log("Disconnected from QiSession");
    });
}

function setupTabletButtons() {
    var buttons = document.querySelectorAll("[data-event]");

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function () {
            var eventName = this.getAttribute("data-event");
            var visualName = this.getAttribute("data-visual");

            sendTabletEvent(eventName);
            runTabletVisual(visualName);
        });
    }
}

function runTabletVisual(visualName) {
    if (visualName === "wave") {
        animatePepper("wave");
    }

    if (visualName === "confetti") {
        makeConfetti(true);
    }
}

function animatePepper(className) {
    var pepper = document.getElementById("pepper-avatar");

    if (!pepper) {
        return;
    }

    removeClass(pepper, "pulse");
    removeClass(pepper, "wave");

    setTimeout(function () {
        addClass(pepper, className);

        setTimeout(function () {
            removeClass(pepper, className);
        }, 900);
    }, 20);
}

function makeConfetti(clearExisting) {
    var area = document.getElementById("confetti-area");

    if (!area) {
        return;
    }

    if (typeof clearExisting === "undefined") {
        clearExisting = true;
    }

    if (clearExisting) {
        area.innerHTML = "";
    }

    for (var i = 0; i < 28; i++) {
        var piece = document.createElement("span");

        piece.className = "confetti-piece";

        if (i % 3 === 1) {
            piece.className += " alt";
        }

        if (i % 3 === 2) {
            piece.className += " alt2";
        }

        piece.style.left = (30 + (i * 43) % 1100) + "px";
        piece.style.animationDelay = ((i % 6) * 0.08) + "s";

        area.appendChild(piece);
    }

    setTimeout(function () {
        area.innerHTML = "";
    }, 2100);
}

window.addEventListener("DOMContentLoaded", function () {
    renderPhase();
    setupTabletButtons();
});
