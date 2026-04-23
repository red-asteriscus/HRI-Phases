const SHEET_URL = "https://script.google.com/macros/s/AKfycbxOmQCvsdLluWkQctzjxJnsZYESUSu50vT_0ZSZUNMn-8bNa7Ps5XeUPQiRGNuN1i2k3A/exec";

var session = null;
var currentRating = 0;
var resetTimer = null;

// ── Google Sheets submission ──────────────────────────────
function submitToSheet(rating) {
    fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ rating: rating })
    }).catch(function(err) {
        console.log("Sheet submission failed:", err);
    });
}

function setInstruction(message) {
    var instruction = document.getElementById('instruction');
    if (instruction) {
        instruction.textContent = message;
    }
}

function getMemoryService(callback) {
    if (!session) {
        console.warn('getMemoryService: No session available');
        return;
    }

    session.service('ALMemory').then(function(memory) {
        callback(memory);
    }, function(error) {
        console.error('ALMemory unavailable:', error);
    });
}

function highlightStars(rating) {
    rating = parseInt(rating, 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
        return;
    }

    currentRating = rating;
    var stars = document.querySelectorAll('.star');
    for (var i = 0; i < stars.length; i++) {
        if (i < rating) {
            stars[i].classList.add('active');
        } else {
            stars[i].classList.remove('active');
        }
    }

    var submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.disabled = false;
    }

    setInstruction('You selected ' + rating + ' star' + (rating > 1 ? 's' : '') + '. Press Submit.');
}

function resetSurvey() {
    currentRating = 0;

    var container = document.getElementById('container');
    var thankYou = document.getElementById('thank-you');
    var submitBtn = document.getElementById('submit-btn');
    var stars = document.querySelectorAll('.star');
    var checkIcon = document.querySelector('.check-icon');

    if (container) {
        container.style.display = 'block';
    }
    if (thankYou) {
        thankYou.hidden = true;
        if (checkIcon) {
            checkIcon.textContent = "✓";
            checkIcon.style.color = "#27ae60";
        }
    }
    if (submitBtn) {
        submitBtn.disabled = true;
    }

    for (var i = 0; i < stars.length; i++) {
        stars[i].classList.remove('active');
    }

    setInstruction('Tap a star, then press Submit');
}

function submitRating(notifyRobot) {
    // If called from event listener, notifyRobot will be an Event object
    if (typeof notifyRobot !== 'boolean') {
        notifyRobot = true;
    }

    if (!currentRating) {
        setInstruction('Please choose a star rating first.');
        return;
    }

    // ── Send to Google Sheets ─────────────────────────────
    submitToSheet(currentRating);

    if (notifyRobot) {
        getMemoryService(function(memory) {
            memory.raiseEvent('Feedback/TouchInput', currentRating);
        });
    }

    var container = document.getElementById('container');
    var thankYou = document.getElementById('thank-you');

    if (container) {
        container.style.display = 'none';
    }
    if (thankYou) {
        var thankYouTitle = thankYou.querySelector('h2');
        var thankYouText = thankYou.querySelector('p');
        var checkIcon = thankYou.querySelector('.check-icon');

        if (currentRating <= 2) {
            thankYouTitle.textContent = "We Appreciate Your Honesty";
            thankYouText.textContent = "We are committed to improving our graduation experience.";
            if (checkIcon) checkIcon.textContent = "✓";
            if (checkIcon) checkIcon.style.color = "#27ae60";
        } else if (currentRating == 3) {
            thankYouTitle.textContent = "Thank You!";
            thankYouText.textContent = "Your feedback helps us keep improving every day.";
            if (checkIcon) checkIcon.textContent = "✓";
            if (checkIcon) checkIcon.style.color = "#27ae60";
        } else {
            thankYouTitle.textContent = "Thank You, Graduate!";
            thankYouText.textContent = "We're thrilled you had a great day! Your feedback is very valuable.";
            if (checkIcon) checkIcon.textContent = "✓";
            if (checkIcon) checkIcon.style.color = "#27ae60";
        }

        thankYou.hidden = false;
    }

    if (resetTimer) {
        clearTimeout(resetTimer);
    }
    resetTimer = setTimeout(resetSurvey, 7000);
}

function initializePepper() {
    if (typeof QiSession === 'undefined') {
        console.warn('QiSession not found. Running in standalone tablet preview mode.');
        return;
    }

    QiSession(function(s) {
        session = s;
        console.log('Connected to Pepper Session (Feedback)');

        getMemoryService(function(memory) {
            console.log('Subscribing to Feedback/VoiceInput...');
            memory.subscriber('Feedback/VoiceInput').then(function(subscriber) {
                console.log('Successfully subscribed to Feedback/VoiceInput');
                subscriber.signal.connect(function(value) {
                    console.log('Voice event received! Raw value:', value);
                    
                    // Debug info on screen
                    setInstruction('Robot said: ' + value);
                    
                    var ratingMap = {
                        "one": 1, "two": 2, "three": 3, "four": 4, "five": 5
                    };
                    
                    var strValue = String(value).toLowerCase().trim();
                    var numericRating = ratingMap[strValue] || parseInt(strValue, 10);
                    
                    if (!isNaN(numericRating) && numericRating >= 1 && numericRating <= 5) {
                        console.log('Parsed numeric rating:', numericRating);
                        highlightStars(numericRating);
                        // Auto-submit after a small delay
                        setTimeout(function() {
                            submitRating(false);
                        }, 1000);
                    } else {
                        console.warn('Could not parse rating from value:', value);
                    }
                });
            }, function(error) {
                console.error('Could not subscribe to Feedback/VoiceInput:', error);
            });
        });
    }, function(error) {
        console.error('Disconnected from Pepper:', error);
    });
}

function bindUi() {
    var stars = document.querySelectorAll('.star');
    for (var i = 0; i < stars.length; i++) {
        stars[i].addEventListener('click', function() {
            highlightStars(this.getAttribute('data-rating'));
        });
    }

    var submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitRating);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    bindUi();
    resetSurvey();
    initializePepper();
});