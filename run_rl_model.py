import asyncio
from gymnasium import make as gym_make
from my_game_interface import MyGameInterface  # Adjust the import path as necessary
from rtgym.envs.real_time_env import DEFAULT_CONFIG_DICT

# Define the URL where your game's WebSocket server is running
WEBSOCKET_URL = 'ws://localhost:6789'

async def main():
    # Instantiate your custom interface
    my_interface = MyGameInterface(WEBSOCKET_URL)

    # Prepare the configuration dictionary
    my_config = DEFAULT_CONFIG_DICT.copy()
    my_config['interface'] = my_interface

    # Create the Real-Time Gym environment
    env = gym_make("real-time-gym-ts-v1", config=my_config, disable_env_checker=True)

    obs = env.reset()
    done = False
    while not done:
        # Example: Select an action randomly
        action = env.action_space.sample()

        # Step the environment forward by applying the action
        obs, reward, done, info = await env.step(action)

        print(f"Reward: {reward}, Done: {done}")

        if done:
            obs = env.reset()

if __name__ == "__main__":
    asyncio.run(main())
