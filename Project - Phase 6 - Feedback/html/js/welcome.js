var session = null;
var APP_ID = "project-98b01d";
var BASE_URL = "http://198.18.0.1/apps/" + APP_ID + "/";

function updateImage(src) {
    var img = document.getElementById("main-image");
    if (!src) return;

    // Apply fade-out
    img.classList.add("fade-out");

    setTimeout(function() {
        // Correct path logic: If it starts with http or is a local relative path, don't prepend BASE_URL
        img.src = (src.indexOf("http") === 0 || src.indexOf("..") === 0) ? src : BASE_URL + src;
        
        // When new image is loaded, fade back in
        img.onload = function() {
            img.classList.remove("fade-out");
        };
    }, 500);
}

function updateSubtitle(text) {
    var speechBox = document.getElementById("pepper-speech");
    if (speechBox) {
        speechBox.innerText = text;
    }
}

if (typeof QiSession === 'undefined') {
    console.log("Testing locally: loading mock content");
    updateImage("../pics/suit_picture.png");
    updateSubtitle("Welcome to the Class of 2026");
} else {
    QiSession(function (s) {
        session = s;
        console.log("Connected for Welcome Stage!");
        
        session.service("ALMemory").then(function (memory) {
            // Listen for image switch events
            memory.subscriber("App/DisplayImage").then(function (subscriber) {
                subscriber.signal.connect(function (src) {
                    updateImage(src);
                });
            });

            // Listen for subtitle updates
            memory.subscriber("App/Subtitle").then(function (subscriber) {
                subscriber.signal.connect(function (text) {
                    updateSubtitle(text);
                });
            });
        });
    }, function () {
        console.log("Disconnected from Pepper");
    });
}
