var activeKey = "guest1_waiting";
var activeGuest = null;
var thankYouSent = false;

var guestMap = {
    "guest1_waiting": {
        name: "Dr. Eng. Marcel Daccache",
        title: "Expert in Software Engineering",
        status: "Waiting for the guest speaker to arrive on stage",
        arrived: false,
        thankEvent: "guest1ThankYou"
    },

    "guest1_arrived": {
        name: "Dr. Eng. Marcel Daccache",
        title: "Expert in Software Engineering",
        status: "Guest speaker is now on stage",
        arrived: true,
        thankEvent: "guest1ThankYou"
    },

    "guest2_waiting": {
        name: "Second Guest Speaker Name",
        title: "Second Guest Speaker Title",
        status: "Waiting for the next guest speaker to arrive on stage",
        arrived: false,
        thankEvent: "guest2ThankYou"
    },

    "guest2_arrived": {
        name: "Second Guest Speaker Name",
        title: "Second Guest Speaker Title",
        status: "Next guest speaker is now on stage",
        arrived: true,
        thankEvent: "guest2ThankYou"
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

function initGuestIntroPage() {
    activeKey = getUrlParam("key", "guest1_waiting");

    if (guestMap[activeKey]) {
        activeGuest = guestMap[activeKey];
    } else {
        activeGuest = guestMap["guest1_waiting"];
        activeKey = "guest1_waiting";
    }

    displayGuestInformation();
}

function displayGuestInformation() {
    var body = document.getElementsByTagName("body")[0];
    var thankButton = document.getElementById("thank-you-btn");

    setText("speaker-name", activeGuest.name);
    setText("speaker-title", activeGuest.title);
    setText("arrival-status", activeGuest.status);

    if (activeGuest.arrived) {
        addClass(body, "guest-arrived");

        if (thankButton) {
            thankButton.style.display = "inline-block";
        }
    } else {
        removeClass(body, "guest-arrived");

        if (thankButton) {
            thankButton.style.display = "none";
        }
    }
}

function thankPepper() {
    var button = document.getElementById("thank-you-btn");

    if (thankYouSent) return;

    thankYouSent = true;

    if (button) {
        addClass(button, "sent");
        button.innerHTML = "Thank you sent";
    }

    makeConfetti();
    raiseTabletEvent(activeGuest.thankEvent, 1);
}

function raiseTabletEvent(eventName, eventValue) {
    if (typeof raiseEvent === "function") {
        raiseEvent(eventName, eventValue);
    }
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

function makeConfetti() {
    var area = document.getElementById("confetti-area");
    var piece;
    var i;

    if (!area) return;

    area.innerHTML = "";

    for (i = 0; i < 30; i++) {
        piece = document.createElement("span");
        piece.className = "confetti-piece";

        if (i % 3 === 1) {
            piece.className += " alt";
        }

        if (i % 3 === 2) {
            piece.className += " alt2";
        }

        piece.style.left = (30 + (i * 41) % 1100) + "px";
        piece.style.animationDelay = ((i % 6) * 0.08) + "s";

        area.appendChild(piece);
    }

    setTimeout(function () {
        area.innerHTML = "";
    }, 2100);
}

window.addEventListener("DOMContentLoaded", function () {
    initGuestIntroPage();
});