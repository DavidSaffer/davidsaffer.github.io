
document.addEventListener('DOMContentLoaded', function() {

        // Timer functionality for no.html
    if (document.getElementById('timer')) { // Check if on the no.html page
        let timeLeft = 15; // 30 seconds countdown

        const timerId = setInterval(function() {
            timeLeft--;
            document.getElementById('timer').textContent = `(You have ${timeLeft} seconds before the page resets)`;

            if (timeLeft <= 0) {
                clearInterval(timerId);
                window.location.href = 'index.html'; // Redirect when timer ends
            }
        }, 1000);
    }

});

