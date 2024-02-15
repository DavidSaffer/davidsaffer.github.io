document.addEventListener("DOMContentLoaded", () => {


    const peer = new Peer();
      
    let name = '';
    let peerId = null;


    peer.on('open', function(id) {
        console.log('My peer ID is: ' + id);
        peerId = id;
    });

    // peer.on('data', function(data) {
    //     console.log('Received', data);
    // });
    

    // Query DOM
    // initial page
    const initial_page = document.getElementById('initial_page');
    const name_input = document.getElementById('nickname');
    const go_button = document.getElementById('go_button');

    go_button.onclick = function() {
        name = name_input.value;
        go_to_lobby();
    }

    function go_to_lobby() {
        initial_page.style.display = "none";
        loby.style.display = "flex";
    }

    // lobby page
    const loby = document.getElementById('lobby');
    
    const create_lobby_button = document.getElementById('create_lobby_button');
    const join_lobby_button = document.getElementById('join_lobby_button');
    
    const lobby_modal = document.getElementById('lobby_modal');
    const lobby_modal_title = document.getElementById('lobby_modal_title');
    // const lobby_modal_text = document.getElementById('lobby_modal_text');
    const lobby_modal_input = document.getElementById('lobby_modal_input');
    const lobby_modal_button = document.getElementById('lobby_modal_button');

    const lobby_modal_coppy_button = document.getElementById('lobby_modal_coppy_button');
    const lobby_modal_code = document.getElementById('lobby_modal_code');

    function copyLobbyCode() {
        // Copy the text inside the text field
        navigator.clipboard.writeText(lobby_modal_code.value)
            .then(() => {
                // Optionally, show a message to indicate that the code was copied
                alert('Copied the lobby code: ' + lobby_modal_code.value);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
    }

    // Set up the click event listener for the copy button
    lobby_modal_coppy_button.onclick = copyLobbyCode;

    
    create_lobby_button.onclick = function() {
        // Set the lobby code to the input's value
        lobby_modal_code.style.display = "block";
        lobby_modal_coppy_button.style.display = "block";
        lobby_modal_code.value = peerId; // Assuming peerId is your lobby code

        // Show the modal
        lobby_modal.style.display = "block";
        lobby_modal_title.innerText = "Lobby Code";

        // Automatically select the lobby code text for easy copying (optional)
        lobby_modal_code.select();
        lobby_modal_code.setSelectionRange(0, 99999); // For mobile devices

        lobby_modal_input.style.display = "none"; // Hide input

        lobby_modal.style.display = "block";
        lobby_modal_title.innerText = "Lobby Code";

        // lobby_modal_text.style.display = "block"; // Show text
        // lobby_modal_text.innerText = peerId;

        lobby_modal_button.onclick = function() {
            startGame();
        }
        

    }

    join_lobby_button.onclick = function() {
        // lobby_modal_text.style.display = "none"; // Hide text
        lobby_modal_code.style.display = "none"; // Hide text
        lobby_modal_coppy_button.style.display = "none"; // Hide button

        lobby_modal.style.display = "block";
        lobby_modal_title.innerText = "Enter Lobby Code";
        lobby_modal_input.style.display = "block"; // Show input
        lobby_modal_input.placeholder = 'Enter Lobby Code...';

        lobby_modal_button.onclick = joinGame;
        
        
    }

    const game_input = document.getElementById('game_input');
    

    function joinGame() {
        const lobby_code = lobby_modal_input.value;
        try {
 
            const conn = peer.connect(lobby_code);

            conn.on('open', () => {
                conn.send(`Hello! I am ${name}`);
            });
             // Listen for data from the connection
            conn.on('data', function(data) {
                console.log("Received data: ", data);
                if (data.type === 'game_input_change') {
                    game_input.value = data.message;
                }
            });

            // Send game input changes
            game_input.addEventListener('input', function() {
                conn.send({ type: 'game_input_change', message: game_input.value });
            });

        } 
        catch (error) {
            console.log(error);
        }
        showGame();
    }

    function startGame() {
        peer.on('connection', function(conn) {
            // Listen for data from the connection
            conn.on('data', function(data) {
                console.log("Received data: ", data);
                if (data.type === 'game_input_change') {
                    game_input.value = data.message;
                }
            });

            // Broadcast game input changes to all connected peers
            game_input.addEventListener('input', function() {
                conn.send({ type: 'game_input_change', message: game_input.value });
            });
        });
        showGame();
    }

    window.onclick = function(event) {
        if (event.target == lobby_modal) {
            lobby_modal.style.display = "none";
        }
    }


    function showGame() {
        lobby_modal.style.display = "none";
        loby.style.display = "none";
        game.style.display = "flex";
    }
});
