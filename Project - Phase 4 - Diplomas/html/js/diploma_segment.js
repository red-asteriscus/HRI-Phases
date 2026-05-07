var activePhase = "diploma";
var buttonLocked = false;
var qiSession = null;
var qiMemory = null;
var celebrationStarted = false;
var cleanupTimer = null;
var confettiInterval = null;
var fireworkInterval = null;

var graduateMap = {
    "graduates": {
        number: "D",
        name: "Computer Engineering Graduates",
        title: "Class of 2026",
        visualLabel: "Graduates",
        icon: "both"
    },

    "dean": {
        number: "D",
        name: "Dean",
        title: "Diploma Presentation",
        visualLabel: "Dean",
        icon: "male"
    },

    "tatiana": {
        number: "1",
        name: "Tatiana",
        title: "Graduating with Honor",
        visualLabel: "Graduate 1",
        icon: "female"
    },

    "leana": {
        number: "2",
        name: "Leana",
        title: "Graduating with Distinction",
        visualLabel: "Graduate 2",
        icon: "female"
    },

    "class": {
        number: "26",
        name: "Congratulations",
        title: "Computer Engineering Class of 2026",
        visualLabel: "Class of 2026",
        icon: "both"
    }
};

var phaseMap = {
    "diploma": {
        graduate: "graduates",
        step: "diploma",
        label: "DIPLOMA SEGMENT",
        text: "Diploma Distribution",
        helper: "We now recognize the achievements of our Computer Engineering graduates.",
        buttonText: "",
        sentText: "",
        eventName: "",
        confetti: false,
        fireworks: false
    },

    "dean_invitation": {
        graduate: "dean",
        step: "dean_invitation",
        label: "DEAN INVITATION",
        text: "Presenting the Diplomas",
        helper: "The Dean is invited to the stage.",
        buttonText: "",
        sentText: "",
        eventName: "",
        confetti: false,
        fireworks: false
    },

    "student1_call": {
        graduate: "tatiana",
        step: "student1_call",
        label: "CALLING GRADUATE",
        text: "Please come forward",
        helper: "Tatiana is being called to receive her diploma.",
        buttonText: "",
        sentText: "",
        eventName: "",
        confetti: false,
        fireworks: false
    },

    "student1_wait": {
        graduate: "tatiana",
        step: "student1_wait",
        label: "DIPLOMA HANDOFF",
        text: "Waiting for diploma handoff",
        helper: "",
        buttonText: "Diploma Received",
        sentText: "Received!",
        eventName: "student1ReceivedDiploma",
        confetti: true,
        fireworks: false
    },

    "student2_call": {
        graduate: "leana",
        step: "student2_call",
        label: "CALLING GRADUATE",
        text: "Please come forward",
        helper: "Leana is being called to receive her diploma.",
        buttonText: "",
        sentText: "",
        eventName: "",
        confetti: false,
        fireworks: false
    },

    "student2_wait": {
        graduate: "leana",
        step: "student2_wait",
        label: "DIPLOMA HANDOFF",
        text: "Waiting for diploma handoff",
        helper: "",
        buttonText: "Diploma Received",
        sentText: "Received!",
        eventName: "student2ReceivedDiploma",
        confetti: true,
        fireworks: false
    },

    "group_congrats": {
        graduate: "class",
        step: "group_congrats",
        label: "CONGRATULATIONS",
        text: "Graduating Class",
        helper: "Congratulations to the Computer Engineering Class of 2026.",
        buttonText: "",
        sentText: "",
        eventName: "",
        confetti: true,
        fireworks: true
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
    if (!phase) {
        return "diploma";
    }

    phase = phase.toLowerCase();

    if (phase === "opening" || phase === "intro" || phase === "diploma_intro") {
        return "diploma";
    }

    if (phase === "dean" || phase === "dean_invite" || phase === "dean_invitation") {
        return "dean_invitation";
    }

    if (phase === "student1" || phase === "student1_call" || phase === "student1_cal" || phase === "tatiana" || phase === "tatiana_call") {
        return "student1_call";
    }

    if (phase === "student1_wait" || phase === "student1_wai" || phase === "tatiana_wait" || phase === "tatiana_receiving") {
        return "student1_wait";
    }

    if (phase === "student2" || phase === "student2_call" || phase === "student2_cal" || phase === "leana" || phase === "leana_call") {
        return "student2_call";
    }

    if (phase === "student2_wait" || phase === "student2_wai" || phase === "student2_wa" || phase === "leana_wait" || phase === "leana_receiving") {
        return "student2_wait";
    }

    if (phase === "congrats" || phase === "congratulations" || phase === "group" || phase === "group_congrats") {
        return "group_congrats";
    }

    if (phaseMap[phase]) {
        return phase;
    }

    return "diploma";
}

function initDiplomaPage() {
    var phase = getUrlParam("phase", "");

    if (phase === "") {
        phase = getUrlParam("key", "diploma");
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
    var graduate;
    var body;
    var button;

    activePhase = normalizePhase(phase);
    data = phaseMap[activePhase];

    if (!data) {
        data = phaseMap["diploma"];
        activePhase = "diploma";
    }

    graduate = graduateMap[data.graduate];

    if (!graduate) {
        graduate = graduateMap["graduates"];
    }

    body = document.getElementsByTagName("body")[0];
    button = document.getElementById("main-button");
    buttonLocked = false;
    celebrationStarted = false;

    clearCelebrations();

    if (body) {
        body.className = "phase-" + activePhase;
    }

    setText("speaker-badge", graduate.number);
    setText("guest-label", graduate.visualLabel);
    setGuestIcon(graduate.icon);
    setText("intro-label", data.label);
    setText("speaker-name", graduate.name);
    setText("speaker-title", graduate.title);
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

    if (activePhase === "group_congrats") {
        startContinuousCelebration();
    }
}

function updatePhaseTrack(stepName) {
    var steps = [
        "diploma",
        "dean_invitation",
        "student1_call",
        "student1_wait",
        "student2_call",
        "student2_wait",
        "group_congrats"
    ];

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
        makeConfetti(34, 1700);
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

    if (confettiInterval) {
        clearInterval(confettiInterval);
        confettiInterval = null;
    }

    if (fireworkInterval) {
        clearInterval(fireworkInterval);
        fireworkInterval = null;
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
    var width;

    if (!area) {
        return;
    }

    width = window.innerWidth || 1200;

    for (i = 0; i < count; i++) {
        piece = document.createElement("span");
        piece.className = "confetti-piece";

        if (i % 3 === 1) {
            piece.className = "confetti-piece dark";
        }

        if (i % 3 === 2) {
            piece.className = "confetti-piece light";
        }

        piece.style.left = (20 + ((i * 47 + Math.floor(Math.random() * 90)) % (width - 40))) + "px";
        piece.style.webkitAnimationDelay = ((i % 10) * 65) + "ms";
        piece.style.animationDelay = ((i % 10) * 65) + "ms";

        area.appendChild(piece);

        removeElementLater(piece, duration + 1200);
    }
}

function removeElementLater(el, delay) {
    setTimeout(function () {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }, delay);
}

function startContinuousCelebration() {
    var width;
    var height;

    if (celebrationStarted) {
        return;
    }

    celebrationStarted = true;

    width = window.innerWidth || 1200;
    height = window.innerHeight || 700;

    makeConfetti(70, 2400);

    makeFireworkBurst(width * 0.22, height * 0.22, 0);
    makeFireworkBurst(width * 0.78, height * 0.22, 0);
    makeFireworkBurst(width * 0.50, height * 0.30, 0);

    confettiInterval = setInterval(function () {
        makeConfetti(28, 2200);
    }, 850);

    fireworkInterval = setInterval(function () {
        var currentWidth = window.innerWidth || 1200;
        var currentHeight = window.innerHeight || 700;
        var x = currentWidth * (0.18 + Math.random() * 0.64);
        var y = currentHeight * (0.14 + Math.random() * 0.34);

        makeFireworkBurst(x, y, 0);
    }, 900);
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
    var sparkCount = 28;

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
    removeElementLater(core, 1600);

    ring = document.createElement("span");
    ring.className = "firework-ring";
    ring.style.left = centerX + "px";
    ring.style.top = centerY + "px";
    ring.style.webkitAnimationDelay = delay + "ms";
    ring.style.animationDelay = delay + "ms";
    area.appendChild(ring);
    removeElementLater(ring, 1600);

    for (i = 0; i < sparkCount; i++) {
        angleDeg = (360 / sparkCount) * i;
        angleRad = angleDeg * Math.PI / 180;

        if (i % 3 === 0) {
            radius = 48;
        } else if (i % 3 === 1) {
            radius = 78;
        } else {
            radius = 108;
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
        removeElementLater(spark, 1600);
    }
}

window.onload = function () {
    initDiplomaPage();
};