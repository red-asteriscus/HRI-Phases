var session = null;

if (typeof QiSession === 'undefined') {
    console.log("Testing locally: loading mock image");
    var imgTag = document.getElementById("main-image");
    imgTag.src = "../pics/suit_picture.png";
    imgTag.style.display = "block";
} else {
    // Connect to Pepper's internal memory
    QiSession(function (s) {
        session = s;
        console.log("Connected for Closing!");
        
        session.service("ALMemory").then(function (memory) {
            // Listen for image requests
            memory.subscriber("App/DisplayImage").then(function (subscriber) {
                subscriber.signal.connect(function (src) {
                    var imgTag = document.getElementById("main-image");
                    if (src) {
                        imgTag.src = "http://198.18.0.1/apps/project-98b01d/" + src;
                        imgTag.style.display = "block";
                    } else {
                        imgTag.style.display = "none";
                    }
                });
            });
        });
    }, function () {
        console.log("Disconnected");
    });
}
