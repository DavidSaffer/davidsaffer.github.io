# PixelBomber
Online peer-to-peer multiplayer game

## Description
PixelBomber is a dynamic, real-time multiplayer game built with HTML5 Canvas, JavaScript and PeerJS. The game puts players into an arena that they navigate their avatar to collect coins while evading enemies.

### Why PeerJS
PeerJS removes the need of having a dedicated server. Initially I made a version with Socket.IO, but this would require a server. The game updates at 60hz, so the server load would be high. PeerJS uses the host players' browser to calculate and communicate the game states.

### Challenges and Future Aspirations
Throughout the development of PixelBomber, the first challenge I encountered was chosing the right library to connect clients. Once I settled on PeerJS, the hard part was managing all of the edge cases, like players disconnecting or 

Looking ahead, plans for PixelBomber include the introduction of new gameplay features, such as power-ups and special abilities, enhancing the strategic depth of the game. It could be possible to use openAI's real time gym to train a model that can play the game. But my inital attempt was met with chalenges, mainly the asynchornus nature of PeerJS conflicting with the realtime requirment of realtime gym. 

## How To Play
- Navigate to [davidsaffer.github.io](https://davidsaffer.github.io)
- Chose a nickname and hit go
- Either create a lobby, and share your lobby code with friends
- Or use a lobby code from a friend, and join their lobby
- Chose your player color, and join a team
- Use WASD or arrow keys to control your player
- Collect as many coins as you can without coliding with the red enemies

## License
This project is released under the [MIT License](https://opensource.org/licenses/MIT).
