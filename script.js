document.addEventListener('DOMContentLoaded', function() {

    emailjs.init("fh0yRVFrey9e67XJ0"); // Replace with your public key



    let noButtonClickCount = 0;
    let messages = [
        "HEY! what do you think you're doing???",
        "CHILLLLLL",
        "Are you sure you want to do this??",
        "Lets be rational here desiree",
        "Fine I guess you are free to choose -____-"
    ]
    // Function to move the 'No' button or reset its position
    function moveNoButton() {
        const noButton = document.getElementById('noButton');
        if (noButtonClickCount < 5) {
            // Move the button to a random position
            let randomX, randomY;
            if (noButtonClickCount === 1) {
                // First move, stay near the center (70% area)
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                randomX = centerX + (Math.random() - 0.5) * window.innerWidth * 0.5 - noButton.clientWidth / 2;
                randomY = centerY + (Math.random() - 0.5) * window.innerHeight * 0.5 - noButton.clientHeight / 2;
            } else {
                // Subsequent moves, anywhere on the screen
                const maxX = window.innerWidth - noButton.clientWidth;
                const maxY = window.innerHeight - noButton.clientHeight;
                randomX = Math.floor(Math.random() * maxX);
                randomY = Math.floor(Math.random() * maxY);
            }

            noButton.style.position = 'absolute';
            noButton.style.left = randomX + 'px';
            noButton.style.top = randomY + 'px';
            noButton.style.outline = '2px solid black'; // Add black outline
        } else if (noButtonClickCount === 5) {
            // Reset the button to its original position
            noButton.style.position = 'static'; // or 'relative' depending on your layout
            noButton.style.outline = 'none'; // Remove the outline
        }
    }

    document.getElementById('yesButton').addEventListener('click', function() {
        const now = new Date();
        const formattedDateTime = now.toLocaleString(); // Format date and time

        emailjs.send("service_dt5m0vf", "template_e0w2tb9", { // Replace with your EmailJS service ID and template ID
            message: "Yes button was clicked at" + formattedDateTime
        })
        .then(function(response) {
            window.location.href = 'yes.html'; // Redirect to 'yes.html' when clicked
           console.log("SUCCESS", response.status, response.text);
           
        }, function(error) {
           console.log("FAILED", error);
           window.location.href = 'yes.html'; // Redirect to 'yes.html' when clicked
        });
    });

    // Event listener for 'No' button
    document.getElementById('noButton').addEventListener('click', function() {
        noButtonClickCount++;
        if (noButtonClickCount < 6) {
            document.getElementById("noMessage").innerHTML = messages[noButtonClickCount-1];
            // Move the button
            moveNoButton();
        } else {
            const now = new Date();
            const formattedDateTime = now.toLocaleString(); // Format date and time
            // Redirect after the third click
            emailjs.send("service_dt5m0vf", "template_e0w2tb9", { // Replace with your EmailJS service ID and template ID
                message: "No button was clicked at" + formattedDateTime
            })
            .then(function(response) {
               console.log("SUCCESS", response.status, response.text);
               window.location.href = 'no.html'; // Redirect to 'no.html' when clicked
            }, function(error) {
               console.log("FAILED", error);
               window.location.href = 'no.html'; // Redirect to 'no.html' when clicked
            });
        }
    });

    
    
});
