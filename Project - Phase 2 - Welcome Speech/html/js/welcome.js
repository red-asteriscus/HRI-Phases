var activePhase = "welcome";
var welcomeEventSubscribed = false;

var phaseMap = {
    "welcome": "Welcome to USEK Graduation Ceremony 2026",
    "ready": "Audience, are you ready to start?",
    "speech": "Welcome to USEK Graduation Ceremony 2026"
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

function displayPageInformation() {
    var phase = getUrlParam("phase", "welcome");

    var questionEl = document.getElementById("question-text");

    if (questionEl) {
        questionEl.innerHTML = phaseMap[phase] || phaseMap["welcome"];
    }
}

function updateQuestionState() {
    var phase = getUrlParam("phase", "welcome");

    var groupYesNo = document.getElementById("group-yes-no");

    if (!groupYesNo) return;

    groupYesNo.style.display = "none";

    if (phase === "ready") {
        groupYesNo.style.display = "flex";
    }
}

function setWelcomePhase(newPhase) {
    activePhase = newPhase;

    var basePath = window.location.href.split("?")[0];
    window.location.href = basePath + "?phase=" + encodeURIComponent(newPhase);
}

function handleWelcomeAnswer(eventName) {
    var currentPhase = getUrlParam("phase", "welcome");

    if (currentPhase === "ready" && eventName === "yesAnswer") {
        setWelcomePhase("speech");
        return;
    }

    if (currentPhase === "ready" && eventName === "noAnswer") {
        setWelcomePhase("ready");
        return;
    }
}

function onWelcomeButton(eventName) {
    if (typeof raiseConfirmationEvent === "function") {
        raiseConfirmationEvent(eventName);
    } else if (typeof raiseEvent === "function") {
        raiseEvent(eventName, 1);
    } else {
        handleWelcomeAnswer(eventName);
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
        console.log("Disconnected");
    });
}

window.addEventListener("DOMContentLoaded", function () {
    displayPageInformation();
    updateQuestionState();
    subscribeToTabletAnswerEvents();
});