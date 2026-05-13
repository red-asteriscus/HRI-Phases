var activePhase = "guest1_intro";
var buttonLocked = false;
var qiMemory = null;
var cleanupTimer = null;

var speakerMap = {
    guest1: {
        number: "1",
        name: "Dr. Eng. Marcel Daccache",
        title: "Leading Expert in Software Engineering",
        visualLabel: "Guest Speaker 1",
        icon: "male"
    },

    guest2: {
        number: "2",
        name: "Dr. Eng. Lea Rizk",
        title: "Leading Expert in Artificial Intelligence",
        visualLabel: "Guest Speaker 2",
        icon: "female"
    },

    both: {
        number: "2",
        name: "Thank You",
        title: "To Our Guest Speakers",
        visualLabel: "Guest Speakers",
        icon: "both"
    }
};

var phaseMap = {
    guest1_intro: {
        speaker: "guest1",
        label: "GUEST SPEAKER",
        text: "Please welcome",
        buttonText: "Thank you, Pepper",
        eventName: "guest1ThankYou",
        confetti: true
    },

    guest1_speech: {
        speaker: "guest1",
        label: "NOW SPEAKING",
        text: "Guest Speaker 1",
        buttonText: "Finish Speech",
        eventName: "guest1Finished",
        confetti: false
    },

    guest1_to_guest2: {
        speaker: "guest2",
        label: "PEPPER INTRODUCES GUEST 2",
        text: "Please welcome",
        buttonText: "Thank you, Pepper",
        eventName: "guest2ThankYou",
        confetti: true
    },

    guest2_speech: {
        speaker: "guest2",
        label: "NOW SPEAKING",
        text: "Guest Speaker 2",
        buttonText: "Finish Speech",
        eventName: "guest2Finished",
        confetti: false
    },

    closure: {
        speaker: "both",
        label: "THANK YOU",
        text: "Guest Speaker Session Complete",
        buttonText: "",
        eventName: "",
        confetti: true
    }
};

function getUrlParam(paramName, defaultValue) {
    var query = window.location.search.substring(1);
    var parts = query.split("&");
    var pair;
    var key;
    var value;
    var i;

    for (i = 0; i < parts.length; i++) {
        if (!parts[i]) {
            continue;
        }

        pair = parts[i].split("=");
        key = decodeUrlValue(pair[0]);

        if (key === paramName) {
            value = pair.length > 1 ? pair[1] : "";
            return decodeUrlValue(value);
        }
    }

    return defaultValue;
}

function decodeUrlValue(value) {
    var decodedValue = value || "";

    decodedValue = decodedValue.replace(/\+/g, " ");

    try {
        decodedValue = decodeURIComponent(decodedValue);
    } catch (e) {
        decodedValue = value || "";
    }

    return decodedValue;
}

function getCurrentPhase() {
    var phase = getUrlParam("phase", "guest1_intro");

    if (!phaseMap[phase]) {
        phase = "guest1_intro";
    }

    return phase;
}

function initGuestIntroPage() {
    connectToPepper();
    renderPhase(getCurrentPhase());
}

function connectToPepper() {
    if (typeof QiSession === "undefined") {
        return;
    }

    try {
        QiSession(function (session) {
            session.service("ALMemory").then(function (memory) {
                qiMemory = memory;
            }, function () {
                qiMemory = null;
            });
        }, function () {
            qiMemory = null;
        });
    } catch (e) {
        qiMemory = null;
    }
}

function renderPhase(phase) {
    var data;
    var speaker;
    var body;
    var button;

    activePhase = phase;
    data = phaseMap[activePhase];
    speaker = speakerMap[data.speaker];
    body = document.getElementsByTagName("body")[0];
    button = document.getElementById("main-button");
    buttonLocked = false;

    clearEffects();

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
    setText("main-button", data.buttonText);

    if (button) {
        removeClass(button, "sent");
        button.style.display = data.buttonText === "" ? "none" : "inline-block";
    }

    updatePhaseTrack(activePhase);

    if (activePhase === "closure") {
        startClosureEffects();
    }
}

function updatePhaseTrack(activeStep) {
    var steps = ["guest1_intro", "guest1_speech", "guest1_to_guest2", "guest2_speech", "closure"];
    var i;

    for (i = 0; i < steps.length; i++) {
        removeClass(document.getElementById("step-" + steps[i]), "active");
    }

    addClass(document.getElementById("step-" + activeStep), "active");
}

function onMainButton() {
    var data = phaseMap[activePhase];
    var button = document.getElementById("main-button");

    if (!data || buttonLocked || data.eventName === "") {
        return;
    }

    buttonLocked = true;
    sendTabletEvent(data.eventName, 1);

    if (button) {
        addClass(button, "sent");
        button.innerHTML = "Thank you!";
    }

    if (data.confetti) {
        makeConfetti(28, 1600);
    }
}

function sendTabletEvent(eventName, eventValue) {
    if (qiMemory) {
        try {
            qiMemory.raiseEvent(eventName, eventValue);
            return;
        } catch (e) {
            qiMemory = null;
        }
    }

    if (typeof QiSession === "undefined") {
        return;
    }

    try {
        QiSession(function (session) {
            session.service("ALMemory").then(function (memory) {
                qiMemory = memory;
                qiMemory.raiseEvent(eventName, eventValue);
            });
        }, function () {
            qiMemory = null;
        });
    } catch (e2) {
        qiMemory = null;
    }
}

function setText(id, value) {
    var element = document.getElementById(id);

    if (element) {
        element.innerHTML = value;
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

function clearEffects() {
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

function startClosureEffects() {
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
        clearEffects();
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