var GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxcKSawhm1tP1yVr6h4GPV0DHiLVFGi9dZm3MF5uJ3hzwc1hcViZCOU4ZzHVnscGKFISw/exec";

var qiMemory = null;
var storageKey = "graduation_feedback_survey_data";

/* In-memory fallback for environments where localStorage is unavailable (e.g. Pepper's WebView) */
var surveyDataCache = null;

var questions = {
    overall: {
        number: "Question 1 of 5",
        text: "How was the graduation ceremony overall?",
        helper: "Tap a number from 1 to 5, or say your rating.",
        type: "rating"
    },

    organization: {
        number: "Question 2 of 5",
        text: "How well was the ceremony organized?",
        helper: "Tap a number from 1 to 5, or say your rating.",
        type: "rating"
    },

    pace: {
        number: "Question 3 of 5",
        text: "How was the pace of the ceremony?",
        helper: "Tap a number from 1 to 5, or say your rating.",
        type: "rating"
    },

    pepper: {
        number: "Question 4 of 5",
        text: "How was Pepper's participation?",
        helper: "Tap a number from 1 to 5, or say your rating.",
        type: "rating"
    },

    recommend: {
        number: "Question 5 of 5",
        text: "Should Pepper join future ceremonies?",
        helper: "Tap Yes or No, or answer by voice.",
        type: "yesno"
    },

    complete: {
        number: "Survey Complete",
        text: "Thank you. Your feedback was submitted.",
        helper: "Your response helps us improve future ceremonies.",
        type: "complete"
    }
};

var ratingEventNames = {
    overall: "surveyOverall",
    organization: "surveyOrganization",
    pace: "surveyPace",
    pepper: "surveyPepper"
};

var surveyDataFields = {
    overall: "overallRating",
    organization: "organizationRating",
    pace: "paceRating",
    pepper: "pepperRating"
};

window.onload = function () {
    showWaitingPage();
    setupAnswerButtons();
    connectToPepper();
};

function connectToPepper() {
    if (typeof QiSession === "undefined") {
        return;
    }

    try {
        QiSession(function (session) {
            session.service("ALMemory").then(function (memory) {
                qiMemory = memory;
                subscribeToFeedbackEvents();
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

function subscribeToFeedbackEvents() {
    if (!qiMemory) {
        return;
    }

    qiMemory.subscriber("feedbackSurveyStart").then(function (subscriber) {
        subscriber.signal.connect(function (value) {
            startSurvey(String(value));
        });
    });

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

function showWaitingPage() {
    document.body.className = "waiting";

    setHtml("intro-label", "Feedback Survey");
    setHtml("question-counter", "");
    setHtml("question-text", "Feedback");
    setHtml("helper-text", "");
    setHtml("answers-container", "");
    setHtml("save-status", "");
}

function startSurvey(key) {
    if (!questions[key]) {
        key = "overall";
    }

    if (key === "overall") {
        resetSurveyData();
    }

    displayQuestion(key);
}

function displayQuestion(key) {
    var question = questions[key];

    if (!question) {
        key = "overall";
        question = questions.overall;
    }

    document.body.className = key === "complete" ? "complete" : "";

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
    var labels = {
        1: "Poor",
        2: "Fair",
        3: "Good",
        4: "Great",
        5: "Excellent"
    };
    var html = "";
    var i;
    var eventPrefix = ratingEventNames[key] || "";

    for (i = 1; i <= 5; i++) {
        html += '<button class="rating-btn" type="button" data-key="' + key + '" data-value="' + i + '" data-event="' + eventPrefix + i + '">';
        html += '<span class="rating-number">' + i + '</span>';
        html += '<span class="rating-star">★</span>';
        html += '<span class="rating-label">' + labels[i] + '</span>';
        html += '</button>';
    }

    setHtml("answers-container", html);
}

function displayYesNoButtons() {
    var html = "";

    html += '<button class="choice-btn" type="button" data-key="recommend" data-value="yes" data-event="surveyRecommendYes">Yes</button>';
    html += '<button class="choice-btn" type="button" data-key="recommend" data-value="no" data-event="surveyRecommendNo">No</button>';

    setHtml("answers-container", html);
}

function setupAnswerButtons() {
    var container = document.getElementById("answers-container");

    if (!container) {
        return;
    }

    container.addEventListener("click", function (event) {
        var button = findClickedButton(event.target, container);

        if (button) {
            sendTabletSelection(button);
        }
    });
}

function findClickedButton(element, container) {
    while (element && element !== container) {
        if (element.tagName && element.tagName.toLowerCase() === "button") {
            return element;
        }

        element = element.parentNode;
    }

    return null;
}

function sendTabletSelection(button) {
    var key = button.getAttribute("data-key");
    var value = button.getAttribute("data-value");
    var eventName = button.getAttribute("data-event");

    if (!eventName) {
        return;
    }

    showPressedButton(button);

    if (key === "recommend") {
        setHtml("save-status", "Selected " + capitalize(value) + ". Please wait...");
    } else {
        setHtml("save-status", "Selected " + value + ". Please wait...");
    }

    raiseTabletEvent(eventName, 1);
}

function showPressedButton(button) {
    var buttons = document.getElementsByTagName("button");
    var i;

    if (!button) {
        return;
    }

    for (i = 0; i < buttons.length; i++) {
        buttons[i].className = buttons[i].className.replace(" is-pressed", "");
    }

    button.className = button.className + " is-pressed";
}

function showVoicePressedAnswer(key, answer) {
    var buttons = document.getElementsByTagName("button");
    var i;
    var buttonKey;
    var buttonValue;

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
    var dataField;

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
    dataField = surveyDataFields[key];

    if (dataField) {
        data[dataField] = answer;
    } else if (key === "recommend") {
        data.recommendNextCeremony = answer === "yes" ? "Yes" : "No";
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
        return;
    }

    displayQuestion(nextKey);
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
                qiMemory.raiseEvent(eventName, value);
            });
        }, function () {
            qiMemory = null;
        });
    } catch (e2) {
        qiMemory = null;
    }
}

function getSurveyData() {
    /* Use in-memory cache as primary source; localStorage as secondary persistence */
    if (surveyDataCache) {
        return surveyDataCache;
    }

    try {
        var raw = window.localStorage.getItem(storageKey);

        if (raw) {
            surveyDataCache = JSON.parse(raw);
            return surveyDataCache;
        }
    } catch (e) {
        /* localStorage unavailable (e.g. Pepper WebView) - fall through to fresh object */
    }

    surveyDataCache = makeNewSurveyData();
    return surveyDataCache;
}

function saveSurveyData(data) {
    /* Always update in-memory cache */
    surveyDataCache = data;

    try {
        window.localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
        /* localStorage unavailable - data is still held in surveyDataCache for this session */
    }
}

function resetSurveyData() {
    surveyDataCache = makeNewSurveyData();

    try {
        window.localStorage.setItem(storageKey, JSON.stringify(surveyDataCache));
    } catch (e) {
        /* localStorage unavailable - reset held in-memory */
    }
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

function setHtml(id, value) {
    var element = document.getElementById(id);

    if (element) {
        element.innerHTML = value;
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
