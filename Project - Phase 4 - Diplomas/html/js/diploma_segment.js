var phaseData = {
    diploma: {
        badge: "D",
        label: "DIPLOMA SEGMENT",
        name: "Computer Engineering Graduates",
        title: "Class of 2026",
        visual: "Graduates",
        icon: "both",
        text: "Diploma Distribution",
        helper: "We now recognize the achievements of our Computer Engineering graduates."
    },

    dean_invitation: {
        badge: "D",
        label: "DEAN INVITATION",
        name: "Dean",
        title: "Diploma Presentation",
        visual: "Dean",
        icon: "male",
        text: "Presenting the Diplomas",
        helper: "The Dean is invited to the stage."
    },

    student1_call: {
        badge: "1",
        label: "CALLING GRADUATE",
        name: "Tatiana",
        title: "Graduating with Honor",
        visual: "Graduate 1",
        icon: "female",
        text: "Please come forward",
        helper: "Tatiana is being called to receive her diploma."
    },

    student1_wait: {
        badge: "1",
        label: "DIPLOMA HANDOFF",
        name: "Tatiana",
        title: "Graduating with Honor",
        visual: "Graduate 1",
        icon: "female",
        text: "Waiting for diploma handoff",
        helper: "",
        button: "Diploma Received",
        sent: "Received!",
        event: "student1ReceivedDiploma"
    },

    student2_call: {
        badge: "2",
        label: "CALLING GRADUATE",
        name: "Leana",
        title: "Graduating with Distinction",
        visual: "Graduate 2",
        icon: "female",
        text: "Please come forward",
        helper: "Leana is being called to receive her diploma."
    },

    student2_wait: {
        badge: "2",
        label: "DIPLOMA HANDOFF",
        name: "Leana",
        title: "Graduating with Distinction",
        visual: "Graduate 2",
        icon: "female",
        text: "Waiting for diploma handoff",
        helper: "",
        button: "Diploma Received",
        sent: "Received!",
        event: "student2ReceivedDiploma"
    },

    group_congrats: {
        badge: "26",
        label: "CONGRATULATIONS",
        name: "Congratulations",
        title: "Computer Engineering Class of 2026",
        visual: "Class of 2026",
        icon: "both",
        text: "Graduating Class",
        helper: "Congratulations to the Computer Engineering Class of 2026.",
        celebrate: true
    }
};

var activePhase = "diploma";
var buttonLocked = false;
var qiMemory = null;
var celebrationTimers = [];

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
    var phase = match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : "diploma";

    return phaseData[phase] ? phase : "diploma";
}

function connectPepperMemory() {
    if (typeof QiSession === "undefined") {
        return;
    }

    QiSession(function (session) {
        session.service("ALMemory").then(function (memory) {
            qiMemory = memory;
        });
    }, function () {
        qiMemory = null;
    });
}

function showPhase(phase) {
    var data = phaseData[phase] || phaseData.diploma;
    var button = el("main-button");
    var guestIcon = el("guest-icon");

    activePhase = phaseData[phase] ? phase : "diploma";
    buttonLocked = false;

    clearCelebration();

    document.body.className = "phase-" + activePhase;

    setText("intro-label", data.label);
    setText("speaker-badge", data.badge);
    setText("guest-label", data.visual);
    setText("speaker-name", data.name);
    setText("speaker-title", data.title);
    setText("phase-text", data.text);
    setText("helper-text", data.helper);

    if (guestIcon) {
        guestIcon.className = "guest-icon " + data.icon + "-icon";
    }

    if (button) {
        if (data.button) {
            button.textContent = data.button;
            button.className = "btn";
            button.style.display = "inline-block";
        } else {
            button.textContent = "";
            button.style.display = "none";
        }
    }

    if (data.celebrate) {
        startCelebration();
    }
}

function raiseMemoryEvent(eventName) {
    if (!eventName) {
        return;
    }

    if (qiMemory) {
        qiMemory.raiseEvent(eventName, 1);
        return;
    }

    if (typeof QiSession !== "undefined") {
        QiSession(function (session) {
            session.service("ALMemory").then(function (memory) {
                memory.raiseEvent(eventName, 1);
            });
        });
    }
}

function onDiplomaReceived() {
    var data = phaseData[activePhase];
    var button = el("main-button");

    if (!data || !data.event || buttonLocked) {
        return;
    }

    buttonLocked = true;

    raiseMemoryEvent(data.event);

    if (button) {
        button.textContent = data.sent;
        button.className = "btn sent";
    }

    makeConfetti(34);
}

function clearCelebration() {
    var i;
    var confettiArea = el("confetti-area");
    var fireworksArea = el("fireworks-area");

    for (i = 0; i < celebrationTimers.length; i++) {
        clearInterval(celebrationTimers[i]);
        clearTimeout(celebrationTimers[i]);
    }

    celebrationTimers = [];

    if (confettiArea) {
        confettiArea.innerHTML = "";
    }
    if (fireworksArea) {
        fireworksArea.innerHTML = "";
    }
}

function removeLater(node, delay) {
    var timer = setTimeout(function () {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }, delay);

    celebrationTimers.push(timer);
}

function makeConfetti(count) {
    var area = el("confetti-area");
    var width = window.innerWidth || 1200;
    var piece;
    var i;

    if (!area) {
        return;
    }

    for (i = 0; i < count; i++) {
        piece = document.createElement("span");

        piece.className = "confetti-piece" +
            (i % 3 === 1 ? " dark" : i % 3 === 2 ? " light" : "");

        piece.style.left =
            20 + ((i * 47 + Math.floor(Math.random() * 90)) % (width - 40)) + "px";

        piece.style.webkitAnimationDelay = (i % 10) * 65 + "ms";
        piece.style.animationDelay = piece.style.webkitAnimationDelay;

        area.appendChild(piece);
        removeLater(piece, 2900);
    }
}

function makeFirework(x, y) {
    var area = el("fireworks-area");
    var center;
    var spark;
    var i;
    var angle;
    var radius;

    if (!area) {
        return;
    }

    center = document.createElement("span");
    center.className = "firework-core";
    center.style.left = x + "px";
    center.style.top = y + "px";
    area.appendChild(center);
    removeLater(center, 1600);

    center = document.createElement("span");
    center.className = "firework-ring";
    center.style.left = x + "px";
    center.style.top = y + "px";
    area.appendChild(center);
    removeLater(center, 1600);

    for (i = 0; i < 28; i++) {
        angle = ((360 / 28) * i * Math.PI) / 180;
        radius = i % 3 === 0 ? 48 : i % 3 === 1 ? 78 : 108;

        spark = document.createElement("span");

        spark.className = "firework-spark" +
            (i % 3 === 1 ? " dark" : i % 3 === 2 ? " light" : "");

        spark.style.left = x + Math.cos(angle) * radius + "px";
        spark.style.top = y + Math.sin(angle) * radius + "px";

        area.appendChild(spark);
        removeLater(spark, 1600);
    }
}

function startCelebration() {
    var width = window.innerWidth || 1200;
    var height = window.innerHeight || 700;

    makeConfetti(70);

    makeFirework(width * 0.22, height * 0.22);
    makeFirework(width * 0.78, height * 0.22);
    makeFirework(width * 0.50, height * 0.30);

    celebrationTimers.push(setInterval(function () {
        makeConfetti(28);
    }, 850));

    celebrationTimers.push(setInterval(function () {
        makeFirework(
            width * (0.18 + Math.random() * 0.64),
            height * (0.14 + Math.random() * 0.34)
        );
    }, 900));
}

window.onload = function () {
    connectPepperMemory();

    var btn = el("main-button");
    if (btn) {
        btn.onclick = onDiplomaReceived;
    }

    showPhase(getPhase());
};
