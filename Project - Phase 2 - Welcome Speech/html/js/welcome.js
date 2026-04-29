var activePhase = "welcome";
var welcomeEventSubscribed = false;
var soundEnabled = true;
var toastTimer = null;

var phaseMap = {
    "welcome": {
        title: "Welcome to USEK Graduation Ceremony 2026",
        label: "Welcome Ceremony",
        text: "Tap Pepper or choose a cue to test tablet interaction.",
        sound: "sound-welcome"
    },
    "ready": {
        title: "Audience, are you ready to start?",
        label: "Readiness Check",
        text: "Guests can answer by voice or by tablet.",
        sound: "sound-ready"
    },
    "speech": {
        title: "Welcome to USEK Graduation Ceremony 2026",
        label: "Main Speech",
        text: "Pepper is speaking.",
        sound: "sound-welcome"
    }
};

function getUrlVars() {
    var vars = {};

    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = decodeURIComponent(value);
    });

    return vars;
}

function getUrlParam(param, defaultVal) {
    var urlParam = defaultVal;

    if (window.location.href.indexOf(param + "=") > -1) {
        urlParam = getUrlVars()[param];
    }

    return urlParam;
}

function getPhaseData(phase) {
    if (phaseMap[phase]) {
        return phaseMap[phase];
    }

    return phaseMap["welcome"];
}

function setText(id, value) {
    var el = document.getElementById(id);

    if (el) {
        el.innerHTML = value;
    }
}

function addClass(el, className) {
    if (!el) return;

    if (el.className.indexOf(className) === -1) {
        el.className = el.className + " " + className;
    }
}

function removeClass(el, className) {
    if (!el) return;

    el.className = el.className
        .replace(new RegExp("\\b" + className + "\\b", "g"), "")
        .replace(/  +/g, " ");
}

function displayPageInformation() {
    var phase = getUrlParam("phase", "welcome");
    var data = getPhaseData(phase);
    var body = document.getElementsByTagName("body")[0];

    activePhase = phase;

    if (body) {
        body.className = "phase-" + phase;
    }

    setText("question-text", data.title);
    setText("intro-label", data.label);
    setText("phase-text", data.text);

    updatePhaseTrack(phase);
    updateQuestionState();
    playSound(data.sound);
}

function updatePhaseTrack(phase) {
    var steps = ["welcome", "ready", "speech"];
    var i;
    var el;

    for (i = 0; i < steps.length; i++) {
        el = document.getElementById("step-" + steps[i]);
        removeClass(el, "active");
    }

    el = document.getElementById("step-" + phase);
    addClass(el, "active");
}

function updateQuestionState() {
    var phase = getUrlParam("phase", "welcome");
    var groupYesNo = document.getElementById("group-yes-no");
    var cuePanel = document.getElementById("cue-panel");

    if (groupYesNo) {
        groupYesNo.style.display = "none";
    }

    if (cuePanel) {
        cuePanel.style.display = "block";
    }

    if (phase === "ready") {
        if (groupYesNo) {
            groupYesNo.style.display = "block";
        }

        if (cuePanel) {
            cuePanel.style.display = "none";
        }
    }
}

function setWelcomePhase(newPhase) {
    var basePath = window.location.href.split("?")[0];

    window.location.href = basePath + "?phase=" + encodeURIComponent(newPhase);
}

function handleWelcomeAnswer(eventName) {
    var currentPhase = getUrlParam("phase", "welcome");

    if (currentPhase === "ready" && eventName === "yesAnswer") {
        playSound("sound-cheer");
        makeConfetti();

        setTimeout(function () {
            setWelcomePhase("speech");
        }, 700);

        return;
    }

    if (currentPhase === "ready" && eventName === "noAnswer") {
        playSound("sound-waiting");
        pulsePepper("pulse");

        return;
    }
}

function raiseTabletEvent(eventName, eventValue) {
    if (typeof raiseEvent === "function") {
        raiseEvent(eventName, eventValue);
    }
}

function onWelcomeButton(eventName) {
    playSound("sound-button");
    raiseTabletEvent(eventName, 1);
    handleWelcomeAnswer(eventName);
}

function onCueButton(eventName, actionName) {
    playSound("sound-button");
    raiseTabletEvent(eventName, 1);

    if (actionName === "wave") {
        pulsePepper("wave");
        return;
    }

    if (actionName === "cheer") {
        playSound("sound-cheer");
        makeConfetti();
        return;
    }
}

function subscribeToTabletAnswerEvents() {
    if (welcomeEventSubscribed) return;
    if (typeof QiSession === "undefined") return;

    welcomeEventSubscribed = true;

    QiSession(function (session) {
        session.service("ALMemory").then(function (memory) {
            memory.subscriber("tabletWelcomeAnswer").then(function (subscriber) {
                subscriber.signal.connect(function (value) {
                    handleWelcomeAnswer(String(value));
                });
            }, function (error) {
                console.log("Could not subscribe:", error);
            });
        }, function (error) {
            console.log("Could not access ALMemory:", error);
        });
    }, function () {
        console.log("Disconnected from QiSession");
    });
}

function playSound(id) {
    var audio;
    var playResult;

    if (!soundEnabled) return;

    audio = document.getElementById(id);

    if (!audio) return;

    try {
        audio.currentTime = 0;
        playResult = audio.play();

        if (playResult && typeof playResult.catch === "function") {
            playResult.catch(function () {});
        }
    } catch (err) {
        console.log("Audio play skipped:", err);
    }
}

function pulsePepper(className) {
    var pepper = document.getElementById("pepper-avatar");

    if (!pepper) return;

    removeClass(pepper, "pulse");
    removeClass(pepper, "wave");

    setTimeout(function () {
        addClass(pepper, className);

        setTimeout(function () {
            removeClass(pepper, className);
        }, 900);
    }, 20);
}

function showToast(message) {
    var toast = document.getElementById("toast");

    if (!toast) return;

    toast.innerHTML = message;

    removeClass(toast, "show");

    if (toastTimer) {
        clearTimeout(toastTimer);
    }

    setTimeout(function () {
        addClass(toast, "show");
    }, 20);

    toastTimer = setTimeout(function () {
        removeClass(toast, "show");
    }, 1600);
}

function makeConfetti() {
    var area = document.getElementById("confetti-area");
    var piece;
    var i;

    if (!area) return;

    area.innerHTML = "";

    for (i = 0; i < 28; i++) {
        piece = document.createElement("span");
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
    displayPageInformation();
    subscribeToTabletAnswerEvents();
});