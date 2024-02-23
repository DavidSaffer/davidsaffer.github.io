import json
import asyncio
import websockets
import gymnasium as gym
from gymnasium.spaces import Box, Discrete
from rtgym import RealTimeGymInterface
import numpy as np

class MyGameInterface(RealTimeGymInterface):
    def __init__(self, websocket_url):
        # Assuming the game is running a websocket server at this URL
        self.websocket_url = websocket_url
        self.websocket = None
        asyncio.run(self.connect_to_game())

    async def connect_to_game(self):
        self.websocket = await websockets.connect(self.websocket_url)

    def get_observation_space(self):
        # Define observation space based on the player, enemies, and coins
        # For simplicity, let's consider only the player's state here
        return Box(low=-np.inf, high=np.inf, shape=(6,), dtype=np.float32)

    def get_action_space(self):
        # Define action space based on the possible actions
        # 8 actions: left, stop left, up, stop up, right, stop right, down, stop down
        return Discrete(8)

    def get_default_action(self):
        # Default to 'stop' actions to avoid unintended movement
        # Mapping this to 'stop up' as a neutral action
        return 2  # Assuming this is the index for 'stop up'

    async def send_control(self, control):
        # Map the discrete action to game commands
        actions = [
            'left', 'stop left', 'up', 'stop up', 'right', 'stop right', 'down', 'stop down'
        ]
        action_command = actions[control]
        if self.websocket:
            await self.websocket.send(json.dumps({"action": action_command}))

    def reset(self, seed=None, options=None):
        # Reset your game if needed
        self.websocket.send("reset game")

        # Send a reset command to your game, if applicable
        return self.get_obs_rew_terminated_info()[0], {}

    async def get_obs_rew_terminated_info(self):
        if self.websocket:
            message = await self.websocket.recv()
            game_state = json.loads(message)
            
            # Example extraction of the player state and game paused status
            player = game_state['player']
            observation = np.array([
                player['x'], player['y'], player['dx'], player['dy'],
                player['score'], player['lives']
            ], dtype=np.float32)
            
            # Example reward and termination conditions
            reward = player['score']
            terminated = player['lives'] <= 0
            info = {}  # Additional info, if any
            
            return observation, reward, terminated, info

    # Note: Since rtgym expects synchronous methods, but WebSocket communication is asynchronous,
    # you may need to manage asynchronous event loops or use threads.
