var GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxcKSawhm1tP1yVr6h4GPV0DHiLVFGi9dZm3MF5uJ3hzwc1hcViZCOU4ZzHVnscGKFISw/exec";

var qiSession = null;
var qiMemory = null;

var currentKey = "overall";
var storageKey = "graduation_feedback_survey_data";

var questions = {
    "overall": {
        number: "Question 1 of 5",
        text: "How was the graduation ceremony overall?",
        helper: "Tap a number from 1 to 5, or say your rating.",
        type: "rating"
    },

    "organization": {
        number: "Question 2 of 5",
        text: "How well was the ceremony organized?",
        helper: "Tap a number from 1 to 5, or say your rating.",
        type: "rating"
    },

    "pace": {
        number: "Question 3 of 5",
        text: "How was the pace of the ceremony?",
        helper: "Tap a number from 1 to 5, or say your rating.",
        type: "rating"
    },

    "pepper": {
        number: "Question 4 of 5",
        text: "How was Pepper's participation?",
        helper: "Tap a number from 1 to 5, or say your rating.",
        type: "rating"
    },

    "recommend": {
        number: "Question 5 of 5",
        text: "Should Pepper join future ceremonies?",
        helper: "Tap Yes or No, or answer by voice.",
        type: "yesno"
    },

    "complete": {
        number: "Survey Complete",
        text: "Thank you. Your feedback was submitted.",
        helper: "Your response helps us improve future ceremonies.",
        type: "complete"
    }
};

window.onload = function () {
    connectToPepper();
    initSurveyPage();
};

function connectToPepper() {
    if (typeof QiSession === "undefined") {
        return;
    }

    try {
        QiSession(function (session) {
            qiSession = session;

            session.service("ALMemory").then(function (memory) {
                qiMemory = memory;
                subscribeToFeedbackEvents();
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

function subscribeToFeedbackEvents() {
    if (!qiMemory) {
        return;
    }

    qiMemory.subscriber("feedbackSurveyAnswer").then(function (subscriber) {
        subscriber.signal.connect(function (value) {
            handleSurveyAnswer(String(value));
        });
    });

    qiMemory.subscriber("feedbackSurveyAdvance").then(function (subscriber) {
        subscriber.signal.connect(function (value) {
            handleSurveyAdvance(String(value));
        });
    });
}

function initSurveyPage() {
    var key = getUrlParam("key", "overall");

    if (!key || !questions[key]) {
        key = "overall";
    }

    if (key === "overall") {
        resetSurveyData();
    }

    currentKey = key;
    displayQuestion(currentKey);
}

function displayQuestion(key) {
    var question = questions[key];

    if (!question) {
        question = questions["overall"];
        key = "overall";
    }

    currentKey = key;

    if (key === "complete") {
        document.body.className = "complete";
    } else {
        document.body.className = "";
    }

    setHtml("question-counter", question.number);
    setHtml("question-text", question.text);
    setHtml("helper-text", question.helper);
    setHtml("save-status", "");

    if (question.type === "rating") {
        displayRatingButtons(key);
    } else if (question.type === "yesno") {
        displayYesNoButtons();
    } else {
        setHtml("answers-container", "");
    }
}

function displayRatingButtons(key) {
    var html = "";
    var i;
    var labels = {
        1: "Poor",
        2: "Fair",
        3: "Good",
        4: "Great",
        5: "Excellent"
    };

    for (i = 1; i <= 5; i++) {
        html += '<button class="rating-btn" data-key="' + key + '" data-value="' + i + '" onclick="sendTabletRating(this, \'' + key + '\',' + i + '); return false;">';
        html += '<span class="rating-number">' + i + '</span>';
        html += '<span class="rating-star">★</span>';
        html += '<span class="rating-label">' + labels[i] + '</span>';
        html += '</button>';
    }

    setHtml("answers-container", html);
}

function displayYesNoButtons() {
    var html = "";

    html += '<button class="choice-btn" data-key="recommend" data-value="yes" onclick="sendTabletYesNo(this, \'yes\'); return false;">Yes</button>';
    html += '<button class="choice-btn" data-key="recommend" data-value="no" onclick="sendTabletYesNo(this, \'no\'); return false;">No</button>';

    setHtml("answers-container", html);
}

function sendTabletRating(button, key, value) {
    var eventName = "";

    showPressedButton(button);
    setHtml("save-status", "Selected " + value + ". Please wait...");

    if (key === "overall") {
        eventName = "surveyOverall" + value;
    } else if (key === "organization") {
        eventName = "surveyOrganization" + value;
    } else if (key === "pace") {
        eventName = "surveyPace" + value;
    } else if (key === "pepper") {
        eventName = "surveyPepper" + value;
    }

    if (eventName !== "") {
        raiseTabletEvent(eventName, 1);
    }
}

function sendTabletYesNo(button, value) {
    showPressedButton(button);
    setHtml("save-status", "Selected " + capitalize(value) + ". Please wait...");

    if (value === "yes") {
        raiseTabletEvent("surveyRecommendYes", 1);
    } else {
        raiseTabletEvent("surveyRecommendNo", 1);
    }
}

function showPressedButton(button) {
    var buttons;
    var i;

    if (!button) {
        return;
    }

    buttons = document.getElementsByTagName("button");

    for (i = 0; i < buttons.length; i++) {
        buttons[i].className = buttons[i].className.replace(" is-pressed", "");
    }

    button.className = button.className + " is-pressed";
}

function showVoicePressedAnswer(key, answer) {
    var buttons;
    var i;
    var buttonKey;
    var buttonValue;

    buttons = document.getElementsByTagName("button");

    for (i = 0; i < buttons.length; i++) {
        buttons[i].className = buttons[i].className.replace(" is-pressed", "");

        buttonKey = buttons[i].getAttribute("data-key");
        buttonValue = buttons[i].getAttribute("data-value");

        if (buttonKey === key && buttonValue === answer) {
            buttons[i].className = buttons[i].className + " is-pressed";

            if (key === "recommend") {
                setHtml("save-status", "Selected " + capitalize(answer) + ". Please wait...");
            } else {
                setHtml("save-status", "Selected " + answer + ". Please wait...");
            }
        }
    }
}

function handleSurveyAnswer(value) {
    var parts;
    var key;
    var answer;
    var data;

    if (!value) {
        return;
    }

    parts = value.split("_");

    if (parts.length < 2) {
        return;
    }

    key = parts[0];
    answer = parts[1];

    showVoicePressedAnswer(key, answer);

    data = getSurveyData();

    if (key === "overall") {
        data.overallRating = answer;
    } else if (key === "organization") {
        data.organizationRating = answer;
    } else if (key === "pace") {
        data.paceRating = answer;
    } else if (key === "pepper") {
        data.pepperRating = answer;
    } else if (key === "recommend") {
        if (answer === "yes") {
            data.recommendNextCeremony = "Yes";
        } else {
            data.recommendNextCeremony = "No";
        }
    }

    if (data.inputMethod === "") {
        data.inputMethod = "tablet_or_voice";
    }

    saveSurveyData(data);
}

function handleSurveyAdvance(nextKey) {
    if (!nextKey) {
        return;
    }

    if (nextKey === "complete") {
        displayQuestion("complete");
        submitSurvey();
    } else {
        displayQuestion(nextKey);
    }
}

function getNextKey(key) {
    if (key === "overall") {
        return "organization";
    }

    if (key === "organization") {
        return "pace";
    }

    if (key === "pace") {
        return "pepper";
    }

    if (key === "pepper") {
        return "recommend";
    }

    if (key === "recommend") {
        return "complete";
    }

    return "overall";
}

function submitSurvey() {
    var data = getSurveyData();

    setHtml("save-status", "Saving response...");

    makeConfetti(42, 1700);

    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.indexOf("PASTE_") === 0) {
        setHtml("save-status", "Google Sheet link is not configured.");
        return;
    }

    submitWithHiddenForm(data);

    setTimeout(function () {
        setHtml("save-status", "Response saved.");
        raiseTabletEvent("FeedbackSurveyCompleted", 1);
    }, 1400);
}

function submitWithHiddenForm(data) {
    var iframe;
    var form;
    var input;
    var payload;

    payload = {
        sessionId: data.sessionId,
        overallRating: data.overallRating,
        organizationRating: data.organizationRating,
        paceRating: data.paceRating,
        pepperRating: data.pepperRating,
        recommendNextCeremony: data.recommendNextCeremony,
        inputMethod: data.inputMethod,
        userAgent: navigator.userAgent || ""
    };

    iframe = document.createElement("iframe");
    iframe.name = "feedback_hidden_frame";
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    form = document.createElement("form");
    form.method = "POST";
    form.action = GOOGLE_SCRIPT_URL;
    form.target = "feedback_hidden_frame";
    form.style.display = "none";

    input = document.createElement("input");
    input.type = "hidden";
    input.name = "payload";
    input.value = JSON.stringify(payload);

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
}

function raiseTabletEvent(eventName, value) {
    if (qiMemory) {
        try {
            qiMemory.raiseEvent(eventName, value);
            return;
        } catch (e) {
        }
    }

    if (typeof QiSession !== "undefined") {
        try {
            QiSession(function (session) {
                session.service("ALMemory").then(function (memory) {
                    memory.raiseEvent(eventName, value);
                });
            }, function () {});
        } catch (e2) {
        }
    }
}

function getSurveyData() {
    var raw;
    var data;

    try {
        raw = window.localStorage.getItem(storageKey);
        if (raw) {
            data = JSON.parse(raw);
            return data;
        }
    } catch (e) {
    }

    return makeNewSurveyData();
}

function saveSurveyData(data) {
    try {
        window.localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
    }
}

function resetSurveyData() {
    var data = makeNewSurveyData();
    saveSurveyData(data);
}

function makeNewSurveyData() {
    return {
        sessionId: "survey-" + new Date().getTime(),
        overallRating: "",
        organizationRating: "",
        paceRating: "",
        pepperRating: "",
        recommendNextCeremony: "",
        inputMethod: ""
    };
}

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

function setHtml(id, value) {
    var el = document.getElementById(id);

    if (el) {
        el.innerHTML = value;
    }
}

function capitalize(value) {
    if (!value) {
        return "";
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
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

        piece.style.left = (20 + ((i * 43) % (width - 40))) + "px";
        piece.style.webkitAnimationDelay = ((i % 9) * 70) + "ms";
        piece.style.animationDelay = ((i % 9) * 70) + "ms";

        area.appendChild(piece);
    }

    setTimeout(function () {
        area.innerHTML = "";
    }, duration + 900);
}