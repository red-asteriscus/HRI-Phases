var activePhase = "closing";
var closingEventSubscribed = false;
var toastTimer = null;
var finalConfettiTimer = null;

var phaseMap = {
    "final": {
        title: "Thank you for celebrating with us",
        label: "Closing Message",
        text: "Congratulations, Class of 2026. We wish you success in every next step.",
        showButtons: false,
        confetti: true
    },

    "closing": {
        title: "Before you leave, we would love your feedback",
        label: "Survey Introduction",
        text: "Please take a moment to complete the graduation survey.",
        showButtons: false,
        confetti: false
    },

    "feedback": {
        title: "Are you ready to meet me at the exit?",
        label: "Survey Question",
        text: "",
        showButtons: true,
        confetti: false
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
    var value = defaultVal;

    if (window.location.href.indexOf(param + "=") > -1) {
        value = getUrlVars()[param];
    }

    return value;
}

function getPhaseData(phase) {
    if (phaseMap[phase]) {
        return phaseMap[phase];
    }

    return phaseMap["closing"];
}

function setText(id, value) {
    var element = document.getElementById(id);

    if (element) {
        element.innerHTML = value;
    }
}

function addClass(element, className) {
    if (!element) return;

    if (element.className.indexOf(className) === -1) {
        element.className = element.className + " " + className;
    }
}

function removeClass(element, className) {
    if (!element) return;

    element.className = element.className
        .replace(new RegExp("\\b" + className + "\\b", "g"), "")
        .replace(/  +/g, " ");
}

function displayPageInformation() {
    var phase = getUrlParam("phase", "closing");
    var data = getPhaseData(phase);
    var body = document.getElementsByTagName("body")[0];

    activePhase = phase;

    if (body) {
        body.className = "phase-" + phase;
    }

    setText("question-text", data.title);
    setText("intro-label", data.label);
    setText("phase-text", data.text);

    updateButtonState(data);
    updateConfettiState(data);
}

function updateButtonState(data) {
    var groupYesNo = document.getElementById("group-yes-no");

    if (groupYesNo) {
        groupYesNo.style.display = "none";
    }

    if (data.showButtons && groupYesNo) {
        groupYesNo.style.display = "block";
    }
}

function handleClosingAnswer(eventName) {
    if (eventName === "yesAnswer") {
        makeConfetti(true);
        return;
    }

    if (eventName === "noAnswer") {
        pulsePepper("pulse");
        return;
    }
}

function raiseTabletEvent(eventName, eventValue) {
    if (typeof raiseEvent === "function") {
        raiseEvent(eventName, eventValue);
    }
}

function onClosingButton(eventName) {
    raiseTabletEvent(eventName, 1);
    handleClosingAnswer(eventName);
}

function subscribeToTabletAnswerEvents() {
    if (closingEventSubscribed) return;
    if (typeof QiSession === "undefined") return;

    closingEventSubscribed = true;

    QiSession(function (session) {
        session.service("ALMemory").then(function (memory) {
            memory.subscriber("tabletClosingAnswer").then(function (subscriber) {
                subscriber.signal.connect(function (value) {
                    handleClosingAnswer(String(value));
                });
            }, function (error) {
                console.log("Could not subscribe to tabletClosingAnswer:", error);
            });
        }, function (error) {
            console.log("Could not access ALMemory:", error);
        });
    }, function () {
        console.log("Disconnected from QiSession");
    });
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
    }, 1700);
}

function updateConfettiState(data) {
    if (data.confetti) {
        startFinalConfetti();
        return;
    }

    stopFinalConfetti();
}

function startFinalConfetti() {
    if (finalConfettiTimer) return;

    makeConfetti(false);

    finalConfettiTimer = setInterval(function () {
        makeConfetti(false);
    }, 700);
}

function stopFinalConfetti() {
    var area = document.getElementById("confetti-area");

    if (finalConfettiTimer) {
        clearInterval(finalConfettiTimer);
        finalConfettiTimer = null;
    }

    if (area) {
        area.innerHTML = "";
    }
}

function makeConfetti(clearExisting) {
    var area = document.getElementById("confetti-area");
    var piece;
    var i;

    if (!area) return;

    if (typeof clearExisting === "undefined") {
        clearExisting = true;
    }

    if (clearExisting) {
        area.innerHTML = "";
    }

    for (i = 0; i < 32; i++) {
        piece = document.createElement("span");
        piece.className = "confetti-piece";

        if (i % 3 === 1) {
            piece.className += " alt";
        }

        if (i % 3 === 2) {
            piece.className += " alt2";
        }

        piece.style.left = ((i * 41 + 28) % 1120) + "px";
        piece.style.animationDelay = ((i % 7) * 0.08) + "s";

        area.appendChild(piece);
        removeConfettiPieceLater(piece);
    }

    if (clearExisting) {
        setTimeout(function () {
            area.innerHTML = "";
        }, 2200);
    }
}

function removeConfettiPieceLater(piece) {
    setTimeout(function () {
        if (piece && piece.parentNode) {
            piece.parentNode.removeChild(piece);
        }
    }, 2200);
}

window.addEventListener("DOMContentLoaded", function () {
    displayPageInformation();
    subscribeToTabletAnswerEvents();
});