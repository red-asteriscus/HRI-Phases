var questionMap = {
    ceremony: "Are you here for the graduation ceremony?",
    seating: "Do you need help finding your seat?",
    role: "Are you a staff member or a guest?",
    time: "Would you like to know when the ceremony starts?"
};

function getUrlParam(param, defaultVal) {
    var query = window.location.search.substring(1);
    var pairs = query.split("&");

    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split("=");

        if (decodeURIComponent(pair[0]) === param) {
            return decodeURIComponent(pair[1] || "");
        }
    }

    return defaultVal;
}

function getCurrentQuestionKey() {
    var key = getUrlParam("key", "ceremony");

    if (!questionMap[key]) {
        key = "ceremony";
    }

    return key;
}

function displayPageInformation() {
    var key = getCurrentQuestionKey();
    var questionEl = document.getElementById("question-text");

    if (questionEl) {
        questionEl.innerHTML = questionMap[key];
    }
}

function updateQuestionState() {
    var key = getCurrentQuestionKey();

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

function sendAnswerEvent(eventName) {
    if (typeof QiSession === "undefined") {
        console.log("QiSession is not available. Cannot send event:", eventName);
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

function setupButtonEvents() {
    var buttons = document.querySelectorAll("[data-event]");

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function () {
            var eventName = this.getAttribute("data-event");
            sendAnswerEvent(eventName);
        });
    }
}

window.addEventListener("DOMContentLoaded", function () {
    displayPageInformation();
    updateQuestionState();
    setupButtonEvents();
});
