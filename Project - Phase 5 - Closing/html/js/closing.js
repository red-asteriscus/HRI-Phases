var phases = {
    closing: {
        label: "Survey Introduction",
        title: "Before you leave, we would love your feedback",
        text: "Please take a moment to complete the graduation survey."
    },

    feedback: {
        label: "Survey Question",
        title: "Are you ready to meet me at the exit?",
        text: "",
        buttons: true
    },

    final: {
        label: "Closing Message",
        title: "Thank you for celebrating with us",
        text: "Congratulations, Class of 2026. We wish you success in every next step.",
        confetti: true
    },

    hats: {
        label: "Graduation Moment",
        title: "Congrats!",
        text: "",
        hats: true
    }
};

var memory = null;
var subscribers = [];
var confettiTimer = null;
var hatTimer = null;

function el(id) {
    return document.getElementById(id);
}

function setText(id, value) {
    var element = el(id);
    if (element) {
        element.textContent = value || "";
    }
}

function getPhase() {
    var match = window.location.search.match(/[?&]phase=([^&]+)/);
    var phase = match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : "closing";

    return phases[phase] ? phase : "closing";
}

function connectMemory() {
    if (typeof QiSession === "undefined") {
        return;
    }

    QiSession(function (session) {
        session.service("ALMemory").then(function (service) {
            memory = service;
            subscribeToRobotAnswers();
        });
    });
}

function subscribeToRobotAnswers() {
    if (!memory) {
        return;
    }

    memory.subscriber("tabletClosingAnswer").then(function (subscriber) {
        subscribers.push(subscriber);
        subscriber.signal.connect(function (value) {
            reactToAnswer(String(value));
        });
    });
}

function raiseMemoryEvent(eventName) {
    if (!eventName) {
        return;
    }

    if (memory) {
        memory.raiseEvent(eventName, 1);
        return;
    }

    if (typeof QiSession !== "undefined") {
        QiSession(function (session) {
            session.service("ALMemory").then(function (service) {
                service.raiseEvent(eventName, 1);
            });
        });
    }
}

function showPhase() {
    var phase = getPhase();
    var data = phases[phase];
    var groupYesNo = el("group-yes-no");

    document.body.className = "phase-" + phase;

    setText("intro-label", data.label);
    setText("question-text", data.title);
    setText("phase-text", data.text);

    if (groupYesNo) {
        groupYesNo.style.display = data.buttons ? "block" : "none";
    }

    stopConfetti();
    stopHats();

    if (data.confetti) {
        startConfetti();
    }

    if (data.hats) {
        startHats();
    }
}

function sendAnswer(eventName) {
    raiseMemoryEvent(eventName);
    reactToAnswer(eventName);
}

function reactToAnswer(value) {
    if (value === "yesAnswer") {
        makeConfetti(true);
    }

    if (value === "noAnswer") {
        pulsePepper();
    }
}

function pulsePepper() {
    var pepper = el("pepper-avatar");

    if (!pepper) {
        return;
    }

    pepper.className = "";

    setTimeout(function () {
        pepper.className = "pulse";
    }, 20);

    setTimeout(function () {
        pepper.className = "";
    }, 920);
}

function removeLater(node, delay) {
    setTimeout(function () {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }, delay);
}

function startConfetti() {
    if (confettiTimer) {
        return;
    }

    makeConfetti(false);

    confettiTimer = setInterval(function () {
        makeConfetti(false);
    }, 700);
}

function stopConfetti() {
    if (confettiTimer) {
        clearInterval(confettiTimer);
        confettiTimer = null;
    }

    var area = el("confetti-area");
    if (area) {
        area.innerHTML = "";
    }
}

function makeConfetti(clearExisting) {
    var area = el("confetti-area");
    var piece;
    var i;

    if (!area) {
        return;
    }

    if (clearExisting) {
        area.innerHTML = "";
    }

    for (i = 0; i < 32; i++) {
        piece = document.createElement("span");
        piece.className = "confetti-piece" + (i % 3 === 1 ? " alt" : i % 3 === 2 ? " alt2" : "");
        piece.style.left = ((i * 41 + 28) % 1120) + "px";
        piece.style.animationDelay = ((i % 7) * 0.08) + "s";
        area.appendChild(piece);
        removeLater(piece, 2200);
    }
}

function startHats() {
    if (hatTimer) {
        return;
    }

    makeHats();

    hatTimer = setInterval(makeHats, 850);
}

function stopHats() {
    if (hatTimer) {
        clearInterval(hatTimer);
        hatTimer = null;
    }

    var area = el("hat-fall-area");
    if (area) {
        area.innerHTML = "";
    }
}

function makeHats() {
    var area = el("hat-fall-area");
    var hat;
    var i;

    if (!area) {
        return;
    }

    for (i = 0; i < 14; i++) {
        hat = document.createElement("span");
        hat.className = "falling-hat" + (i % 2 === 1 ? " hat-small" : "") + (i % 3 === 2 ? " hat-gold" : "");
        hat.innerHTML = '<span class="hat-top"></span><span class="hat-band"></span><span class="hat-tassel"></span>';
        hat.style.left = ((i * 83 + 35) % 1120) + "px";
        hat.style.animationDelay = ((i % 7) * 0.13) + "s";
        hat.style.animationDuration = (3.2 + (i % 4) * 0.35) + "s";
        area.appendChild(hat);
        removeLater(hat, 5000);
    }
}

window.onload = function () {
    showPhase();
    connectMemory();

    var yesBtn = el("yes-button");
    var noBtn = el("no-button");

    if (yesBtn) {
        yesBtn.onclick = function () {
            sendAnswer("yesAnswer");
        };
    }

    if (noBtn) {
        noBtn.onclick = function () {
            sendAnswer("noAnswer");
        };
    }
};
