import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { LobbyManager } from "../client/src/game/LobbyManager";
import { Player } from "../client/src/game/Player";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const __dirname = path.resolve(path.dirname(''));

app.use(express.static("client")); // serve client files

app.get("/lobby", function(req, res) {
  res.sendFile(path.join(__dirname, 'client', 'lobby.html'));
});

type Room = {
  id: string;
  lobbyManager: LobbyManager;
};

const rooms: Record<string, Room> = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinGame", (data: { roomId: string; name: string; playerID?: string }) => {
    const { roomId, name, playerID: clientID } = data || {};
    if (!roomId || !name) return;

    if (!rooms[roomId]) {
      rooms[roomId] = {
        id: roomId,
        lobbyManager: LobbyManager.instance,
      };
    }
    const room = rooms[roomId];

    let playerID = clientID || socket.id;

    // If the name is taken by a different ID
    if (room.lobbyManager.nameTaken(name)) {
      socket.emit("nameTaken", name);
      return;
    }

    room.lobbyManager.addPlayer(new Player(playerID, name, "red"));

    socket.data.playerID = playerID;
    socket.join(roomId);

    socket.emit("joined", { //todo might have to add room id?
      playerID
    });

    io.to(roomId).emit("roomState", { //todo gotta give it whatever it needs
      /*players: Object.values(room.players),
      totalPlayers: Object.keys(room.players).length,
      activePlayers: Array.from(room.activePlayerIDs),*/
    });
    //io.to(roomId).emit("players", Object.values(room.players));
  });

  socket.on("startGame", ({ roomId }) => {
    
  });

  //io.to(roomId).emit("roomState", {
      /*players: Object.values(room.players),
      gameOngoing: room.gameOngoing,
      startVotes: room.startVotes.size,
      endVotes: room.endVotes.size,
      totalPlayers: Object.keys(room.players).length,
      activePlayers: Array.from(room.activePlayerIDs),*/
  //});
    //socket.emit('youAre', playerID);

  socket.on("Ready Button", (data: { roomId: string }) => {
    const roomId = data?.roomId;
    if (!roomId) return;

    const playerID = socket.data.playerID || socket.id;
    let lobbyManager = rooms[roomId].lobbyManager;
    lobbyManager.markReady(playerID);

    io.to(roomId).emit("players", rooms[roomId].lobbyManager.getPlayerReadyStatuses());
  });

  socket.on("disconnecting", () => {
    const playerID = socket.data.playerID || socket.id;

    for (const roomId of socket.rooms) {
      if (roomId === socket.id) continue;

      const room = rooms[roomId];
      if (!room) continue;

      console.log("[disconnect cleanup]", { roomId, playerID });

      //todo remove player from gameManager
      // if game becomes empty, end it

      // broadcast updated room state
      io.to(roomId).emit("roomState", {
        /*players: Object.values(room.players),
        gameOngoing: room.gameOngoing,
        startVotes: room.startVotes.size,
        endVotes: room.endVotes.size,
        totalPlayers: Object.keys(room.players).length,
        activePlayers: Array.from(room.activePlayerIDs),*/
      });
    }
  });
});


httpServer.listen(3000, () => console.log("Server running on http://localhost:3000"));