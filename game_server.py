import asyncio
import websockets
import json

async def game_server(websocket, path):
    async for message in websocket:
        # Here, you can parse the received message and possibly update your game's state
        print(f"Received message: {message}")
        # Respond back to the client
        # Parse the received message

        try:
            data = json.loads(message)
             # # Check if this is a game state update
            if data['type'] == 'gameState':
                # Process the game state
                print("Received game state:", data)
        except json.JSONDecodeError:
            print("Received invalid JSON:", message)
            continue

       
        #     # You can now calculate the next action based on this state
        #     next_action = calculate_next_action(data)
            
            # And send that action back to the game
        await websocket.send(json.dumps({"action": "up"}))

def calculate_next_action(game_state):
    # Here, you can calculate the next action based on the game state
    # For now, let's just return a random action
    return "up"

start_server = websockets.serve(game_server, "localhost", 6789)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
