document.addEventListener('DOMContentLoaded', function() {
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
            const maxX = window.innerWidth - noButton.clientWidth;
            const maxY = window.innerHeight - noButton.clientHeight;
            const randomX = Math.floor(Math.random() * maxX);
            const randomY = Math.floor(Math.random() * maxY);

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

    // Event listener for 'Yes' button
    document.getElementById('yesButton').addEventListener('click', function() {
        window.location.href = 'yes.html'; // Redirect to 'yes.html' when clicked
    });

    // Event listener for 'No' button
    document.getElementById('noButton').addEventListener('click', function() {
        noButtonClickCount++;
        if (noButtonClickCount < 6) {
            document.getElementById("noMessage").innerHTML = messages[noButtonClickCount-1];
            // Move the button
            moveNoButton();
        } else {
            // Redirect after the third click
            window.location.href = 'no.html';
        }
    });

    
    
});
