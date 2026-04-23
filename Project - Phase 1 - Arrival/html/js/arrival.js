var activeQuestion = "ceremony";
var arrivalEventSubscribed = false;

var questionMap = {
    "ceremony": "Are you here for the graduation ceremony?",
    "seating": "Do you need help finding your seat?",
    "role": "Are you a staff member or a guest?",
    "time": "Would you like to know when the ceremony starts?"
};

var responseMap = {
    "ceremony_yesAnswer": "Wonderful!",
    "ceremony_noAnswer": "No worries! Have a wonderful day.",
    "seating_yesAnswer": "Of course!",
    "seating_noAnswer": "No problem at all!",
    "role_staffAnswer": "Staff seating is reserved in the VIP section at the front center.",
    "role_guestAnswer": "The White Section is reserved for general seating.",
    "time_yesAnswer": "The ceremony begins in twenty minutes. Enjoy!",
    "time_noAnswer": "Enjoy the ceremony, and congratulations to your graduate!"
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
    var key = getUrlParam("key", "ceremony");
    if (!key) {
        key = "ceremony";
    }

    activeQuestion = key;

    var questionEl = document.getElementById("question-text");
    if (questionEl) {
        questionEl.innerHTML = questionMap[key] || questionMap["ceremony"];
    }
}

function displaySpeech(text) {
    var speechEl = document.getElementById("pepper-speech");
    var mapEl = document.getElementById("map-display");

    if (!speechEl) {
        return;
    }

    if (!text) {
        speechEl.style.display = "none";
        if (mapEl) {
            mapEl.style.display = "none";
        }
        return;
    }

    speechEl.innerHTML = text;
    speechEl.style.display = "block";

    if (
        text.toLowerCase().indexOf("section") !== -1 ||
        text.toLowerCase().indexOf("reserved") !== -1 ||
        text.toLowerCase().indexOf("seating") !== -1
    ) {
        if (mapEl) {
            mapEl.style.display = "block";
        }
    } else {
        if (mapEl) {
            mapEl.style.display = "none";
        }
    }
}

function updateQuestionState() {
    var key = getUrlParam("key", "ceremony");
    if (!key) {
        key = "ceremony";
    }

    activeQuestion = key;

    var groupYesNo = document.getElementById("group-yes-no");
    var groupRole = document.getElementById("group-role");

    if (!groupYesNo || !groupRole) {
        return;
    }

    groupYesNo.style.display = "none";
    groupRole.style.display = "none";

    if (key === "ceremony" || key === "seating" || key === "time") {
        groupYesNo.style.display = "flex";
    } else if (key === "role") {
        groupRole.style.display = "flex";
    }
}

function getNextQuestion(questionKey, eventName) {
    if (questionKey === "ceremony") {
        if (eventName === "yesAnswer") return "seating";
        if (eventName === "noAnswer") return "ceremony";
    }

    if (questionKey === "seating") {
        if (eventName === "yesAnswer") return "role";
        if (eventName === "noAnswer") return "time";
    }

    if (questionKey === "role") {
        if (eventName === "staffAnswer" || eventName === "guestAnswer") return "time";
    }

    if (questionKey === "time") {
        return "ceremony";
    }

    return "ceremony";
}

function setQuestionKey(newKey) {
    activeQuestion = newKey;

    var basePath = window.location.href.split("?")[0];
    window.location.href = basePath + "?key=" + encodeURIComponent(newKey);
}

function handleArrivalAnswer(eventName) {
    var currentKey = getUrlParam("key", "ceremony");
    if (!currentKey) {
        currentKey = "ceremony";
    }

    var responseText = responseMap[currentKey + "_" + eventName] || "Thank you!";
    var nextKey = getNextQuestion(currentKey, eventName);

    displaySpeech(responseText);

    var groupYesNo = document.getElementById("group-yes-no");
    var groupRole = document.getElementById("group-role");

    if (groupYesNo) {
        groupYesNo.style.display = "none";
    }
    if (groupRole) {
        groupRole.style.display = "none";
    }

    setTimeout(function () {
        setQuestionKey(nextKey);
    }, 1800);
}

function onArrivalButton(eventName) {
    if (typeof raiseConfirmationEvent === "function") {
        raiseConfirmationEvent(eventName);
    } else if (typeof raiseEvent === "function") {
        raiseEvent(eventName, 1);
    }
}

function subscribeToTabletAnswerEvents() {
    if (arrivalEventSubscribed) {
        return;
    }

    if (typeof QiSession === "undefined") {
        return;
    }

    arrivalEventSubscribed = true;

    QiSession(function (session) {
        session.service("ALMemory").then(function (memory) {
            memory.subscriber("tabletArrivalAnswer").then(function (subscriber) {
                subscriber.signal.connect(function (value) {
                    handleArrivalAnswer(String(value));
                });
            }, function (error) {
                console.log("Could not subscribe to tabletArrivalAnswer:", error);
            });
        }, function (error) {
            console.log("Could not access ALMemory:", error);
        });
    }, function () {
        console.log("Disconnected");
    });
}