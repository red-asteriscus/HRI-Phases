var activePhase = "guest1_intro";
var buttonLocked = false;
var qiSession = null;
var qiMemory = null;
var celebrationStarted = false;
var cleanupTimer = null;

var speakerMap = {
    "guest1": {
        number: "1",
        name: "Dr. Eng. Marcel Daccache",
        title: "Leading Expert in Software Engineering",
        visualLabel: "Guest Speaker 1",
        icon: "male"
    },

    "guest2": {
        number: "2",
        name: "Dr. Eng. Lea Rizk",
        title: "Leading Expert in Artificial Intelligence",
        visualLabel: "Guest Speaker 2",
        icon: "female"
    },

    "both": {
        number: "2",
        name: "Thank You",
        title: "To Our Guest Speakers",
        visualLabel: "Guest Speakers",
        icon: "both"
    }
};

var phaseMap = {
    "guest1_intro": {
        speaker: "guest1",
        step: "guest1_intro",
        label: "GUEST SPEAKER",
        text: "Please welcome",
        helper: "",
        buttonText: "Thank you, Pepper",
        sentText: "Thank you!",
        eventName: "guest1ThankYou",
        confetti: true
    },

    "guest1_speech": {
        speaker: "guest1",
        step: "guest1_speech",
        label: "NOW SPEAKING",
        text: "Guest Speaker 1",
        helper: "",
        buttonText: "Finish Speech",
        sentText: "Thank you!",
        eventName: "guest1Finished",
        confetti: false
    },

    "guest1_to_guest2": {
        speaker: "guest2",
        step: "guest1_to_guest2",
        label: "PEPPER INTRODUCES GUEST 2",
        text: "Please welcome",
        helper: "",
        buttonText: "Thank you, Pepper",
        sentText: "Thank you!",
        eventName: "guest2ThankYou",
        confetti: true
    },

    "guest2_speech": {
        speaker: "guest2",
        step: "guest2_speech",
        label: "NOW SPEAKING",
        text: "Guest Speaker 2",
        helper: "",
        buttonText: "Finish Speech",
        sentText: "Thank you!",
        eventName: "guest2Finished",
        confetti: false
    },

    "closure": {
        speaker: "both",
        step: "closure",
        label: "THANK YOU",
        text: "Guest Speaker Session Complete",
        helper: "",
        buttonText: "",
        sentText: "",
        eventName: "",
        confetti: true
    }
};

function getUrlParam(paramName, defaultValue) {
    var query = window.location.search;
    var parts;
    var pair;
    var key;
    var value;
    var i;

    if (!query || query.length < 2) {
        return defaultValue;
    }

    query = query.substring(1);
    parts = query.split("&");

    for (i = 0; i < parts.length; i++) {
        pair = parts[i].split("=");
        key = safeDecode(pair[0]);

        if (key === paramName) {
            value = "";

            if (pair.length > 1) {
                value = safeDecode(pair[1]);
            }

            return value;
        }
    }

    return defaultValue;
}

function safeDecode(value) {
    var output = value;

    if (!output) {
        return "";
    }

    output = output.replace(/\+/g, " ");

    try {
        output = decodeURIComponent(output);
    } catch (e) {
        output = value;
    }

    return output;
}

function normalizePhase(phase) {
    if (phase === "guest1_speaking") {
        return "guest1_speech";
    }

    if (phase === "guest2_intro") {
        return "guest1_to_guest2";
    }

    if (phase === "guest2_speaking") {
        return "guest2_speech";
    }

    if (phase === "guest2_done") {
        return "closure";
    }

    if (phase === "guest1_waiting" || phase === "guest1_arrived") {
        return "guest1_intro";
    }

    if (phase === "guest2_waiting" || phase === "guest2_arrived") {
        return "guest1_to_guest2";
    }

    if (phaseMap[phase]) {
        return phase;
    }

    return "guest1_intro";
}

function initGuestIntroPage() {
    var phase = getUrlParam("phase", "");

    if (phase === "") {
        phase = getUrlParam("key", "guest1_intro");
    }

    connectToPepper();
    setPhase(normalizePhase(phase));
}

function connectToPepper() {
    if (typeof QiSession === "undefined") {
        return;
    }

    try {
        QiSession(function (session) {
            qiSession = session;

            session.service("ALMemory").then(function (memory) {
                qiMemory = memory;
            });
        }, function () {
            qiSession = null;
            qiMemory = null;
        });
    } catch (e) {
        qiSession = null;
        qiMemory = null;
    }
}

function setPhase(phase) {
    var data;
    var speaker;
    var body;
    var button;

    activePhase = normalizePhase(phase);
    data = phaseMap[activePhase];
    speaker = speakerMap[data.speaker];
    body = document.getElementsByTagName("body")[0];
    button = document.getElementById("main-button");
    buttonLocked = false;
    celebrationStarted = false;

    clearCelebrations();

    if (body) {
        body.className = "phase-" + activePhase;
    }

    setText("speaker-badge", speaker.number);
    setText("guest-label", speaker.visualLabel);
    setGuestIcon(speaker.icon);
    setText("intro-label", data.label);
    setText("speaker-name", speaker.name);
    setText("speaker-title", speaker.title);
    setText("phase-text", data.text);
    setText("helper-text", data.helper);
    setText("main-button", data.buttonText);

    if (button) {
        removeClass(button, "sent");

        if (data.buttonText === "") {
            button.style.display = "none";
        } else {
            button.style.display = "inline-block";
        }
    }

    updatePhaseTrack(data.step);

    if (activePhase === "closure") {
        startCelebration();
    }
}

function updatePhaseTrack(stepName) {
    var steps = ["guest1_intro", "guest1_speech", "guest1_to_guest2", "guest2_speech", "closure"];
    var i;
    var el;

    for (i = 0; i < steps.length; i++) {
        el = document.getElementById("step-" + steps[i]);
        removeClass(el, "active");
    }

    el = document.getElementById("step-" + stepName);
    addClass(el, "active");
}

function onMainButton() {
    var data = phaseMap[activePhase];
    var button = document.getElementById("main-button");

    if (!data) {
        return;
    }

    if (buttonLocked) {
        return;
    }

    if (data.eventName === "") {
        return;
    }

    buttonLocked = true;
    raiseTabletEvent(data.eventName, 1);

    if (button) {
        addClass(button, "sent");
        button.innerHTML = data.sentText || "Done";
    }

    if (data.confetti) {
        makeConfetti(28, 1600);
    }
}

function raiseTabletEvent(eventName, eventValue) {
    if (qiMemory) {
        try {
            qiMemory.raiseEvent(eventName, eventValue);
            return;
        } catch (e) {
        }
    }

    if (typeof QiSession !== "undefined") {
        try {
            QiSession(function (session) {
                session.service("ALMemory").then(function (memory) {
                    memory.raiseEvent(eventName, eventValue);
                });
            }, function () {});
        } catch (e2) {
        }
    }
}

function setText(id, value) {
    var el = document.getElementById(id);

    if (el) {
        el.innerHTML = value;
    }
}

function setGuestIcon(iconType) {
    var icon = document.getElementById("guest-icon");

    if (!icon) {
        return;
    }

    if (iconType === "female") {
        icon.className = "guest-icon female-icon";
    } else if (iconType === "both") {
        icon.className = "guest-icon both-icon";
    } else {
        icon.className = "guest-icon male-icon";
    }
}

function addClass(el, className) {
    if (!el) {
        return;
    }

    if (el.className.indexOf(className) === -1) {
        el.className = el.className + " " + className;
    }
}

function removeClass(el, className) {
    if (!el) {
        return;
    }

    el.className = el.className.replace(new RegExp("\\b" + className + "\\b", "g"), "");
    el.className = el.className.replace(/  +/g, " ");
}

function clearCelebrations() {
    var confetti = document.getElementById("confetti-area");
    var fireworks = document.getElementById("fireworks-area");

    if (cleanupTimer) {
        clearTimeout(cleanupTimer);
        cleanupTimer = null;
    }

    if (confetti) {
        confetti.innerHTML = "";
    }

    if (fireworks) {
        fireworks.innerHTML = "";
    }
}

function makeConfetti(count, duration) {
    var area = document.getElementById("confetti-area");
    var piece;
    var i;

    if (!area) {
        return;
    }

    area.innerHTML = "";

    for (i = 0; i < count; i++) {
        piece = document.createElement("span");
        piece.className = "confetti-piece";

        if (i % 3 === 1) {
            piece.className = "confetti-piece dark";
        }

        if (i % 3 === 2) {
            piece.className = "confetti-piece light";
        }

        piece.style.left = (35 + ((i * 31) % 1150)) + "px";
        piece.style.webkitAnimationDelay = ((i % 9) * 65) + "ms";
        piece.style.animationDelay = ((i % 9) * 65) + "ms";

        area.appendChild(piece);
    }

    setTimeout(function () {
        area.innerHTML = "";
    }, duration + 900);
}

function startCelebration() {
    if (celebrationStarted) {
        return;
    }

    celebrationStarted = true;

    makeConfetti(42, 2100);

    setTimeout(function () {
        makeFireworkBurst(250, 145, 0);
    }, 220);

    setTimeout(function () {
        makeFireworkBurst(755, 125, 0);
    }, 620);

    setTimeout(function () {
        makeFireworkBurst(500, 215, 0);
    }, 1020);

    setTimeout(function () {
        makeFireworkBurst(910, 230, 0);
    }, 1380);

    setTimeout(function () {
        makeConfetti(36, 1800);
    }, 950);

    cleanupTimer = setTimeout(function () {
        clearCelebrations();
    }, 4200);
}

function makeFireworkBurst(centerX, centerY, delay) {
    var area = document.getElementById("fireworks-area");
    var core;
    var ring;
    var spark;
    var i;
    var angleDeg;
    var angleRad;
    var radius;
    var x;
    var y;
    var sparkCount = 24;

    if (!area) {
        return;
    }

    core = document.createElement("span");
    core.className = "firework-core";
    core.style.left = centerX + "px";
    core.style.top = centerY + "px";
    core.style.webkitAnimationDelay = delay + "ms";
    core.style.animationDelay = delay + "ms";
    area.appendChild(core);

    ring = document.createElement("span");
    ring.className = "firework-ring";
    ring.style.left = centerX + "px";
    ring.style.top = centerY + "px";
    ring.style.webkitAnimationDelay = delay + "ms";
    ring.style.animationDelay = delay + "ms";
    area.appendChild(ring);

    for (i = 0; i < sparkCount; i++) {
        angleDeg = (360 / sparkCount) * i;
        angleRad = angleDeg * Math.PI / 180;

        if (i % 3 === 0) {
            radius = 42;
        } else if (i % 3 === 1) {
            radius = 68;
        } else {
            radius = 92;
        }

        x = centerX + Math.cos(angleRad) * radius;
        y = centerY + Math.sin(angleRad) * radius;

        spark = document.createElement("span");
        spark.className = "firework-spark";

        if (i % 3 === 1) {
            spark.className = "firework-spark dark";
        }

        if (i % 3 === 2) {
            spark.className = "firework-spark light";
        }

        spark.style.left = x + "px";
        spark.style.top = y + "px";
        spark.style.webkitAnimationDelay = delay + "ms";
        spark.style.animationDelay = delay + "ms";

        area.appendChild(spark);
    }
}

window.onload = function () {
    initGuestIntroPage();
};