var session; // Use 'var' for better compatibility with Pepper's older browser
var currentRating = 0;

/**
 * Initialize connection to Pepper's tablet service
 */
function initializePepper() {
    if (typeof QiSession !== 'undefined') {
        QiSession(function (s) {
            session = s;
            console.log("Connected to Pepper!");
            
            // Listen for Pepper hearing a voice rating from QiChat
            session.service("ALMemory").done(function (memory) {
                memory.subscriber("Feedback/VoiceInput").done(function (subscriber) {
                    subscriber.signal.connect(function (value) {
                        // When Pepper hears a number, light up the stars
                        console.log("Voice rating received: " + value);
                        highlightStars(parseInt(value));
                    });
                });
            });
        }, function () {
            console.log("Disconnected from Pepper");
        });
    } else {
        console.warn("QiSession not found. Robot communication disabled.");
    }
}

/**
 * Updates the visual state of the stars and enables the Submit button.
 */
function highlightStars(rating) {
    currentRating = rating; 
    var stars = document.querySelectorAll('.star');
    
    // Iterate through stars to apply active/inactive colors
    for (var i = 0; i < stars.length; i++) {
        if (i < rating) {
            stars[i].style.color = "#f1c40f"; // Matches the University Gold in CSS
            stars[i].classList.add('active');
        } else {
            stars[i].style.color = "#ddd"; // Grey for inactive
            stars[i].classList.remove('active');
        }
    }

    // Enable the button once a rating is chosen
    var submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.backgroundColor = "#2c3e50"; // Reset to main theme color
        submitBtn.style.opacity = "1";
    }
}

/**
 * Sends the final rating to Pepper and shows the thank-you message.
 */
function submitRating() {
    if (currentRating === 0) {
        return; 
    }

    // 1. Raise the event so Pepper's Python/QiChat can see it
    if (session) {
        session.service("ALMemory").done(function (memory) {
            // This triggers your Python script to save to CSV
            memory.raiseEvent("Feedback/TouchInput", currentRating);
        });
    }

    // 2. UI Transition to Thank You screen
    var container = document.getElementById('container');
    var thankYou = document.getElementById('thank-you');
    
    if (container) container.style.display = 'none';
    if (thankYou) thankYou.style.display = 'block';

    // 3. Auto-reset for the next guest after 5 seconds
    setTimeout(function() {
        resetSurvey();
    }, 5000);
}

/**
 * Resets the UI so the next graduate can use it.
 */
function resetSurvey() {
    currentRating = 0;
    var container = document.getElementById('container');
    var thankYou = document.getElementById('thank-you');
    
    if (container) container.style.display = 'block';
    if (thankYou) thankYou.style.display = 'none';
    
    // Reset stars to default state
    var stars = document.querySelectorAll('.star');
    for (var j = 0; j < stars.length; j++) {
        stars[j].style.color = "#ddd";
        stars[j].classList.remove('active');
    }

    // Disable the button until next interaction
    var submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.backgroundColor = "#bdc3c7"; // Disabled color from CSS
    }
}

// Ensure the initialization runs once the window has loaded
window.onload = initializePepper;