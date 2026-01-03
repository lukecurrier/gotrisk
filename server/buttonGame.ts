import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static("client")); // serve client files

type Player = { id: string; name: string; score: number };

type Room = {
  id: string;
  players: Record<string, Player>;
  nameToID: Record<string, string>;

  // existing
  everyoneClickedButton1: Set<string>;

  // new
  gameOngoing: boolean;

  startVotes: Set<string>;
  endVotes: Set<string>;

  // players locked in for the current game
  activePlayerIDs: Set<string>;
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
        players: {},
        nameToID: {},
        everyoneClickedButton1: new Set(),

        gameOngoing: false,
        startVotes: new Set(),
        endVotes: new Set(),
        activePlayerIDs: new Set(),
      };
    }
    const room = rooms[roomId];

    let playerID = clientID || room.nameToID[name] || socket.id;

    // If the name is taken by a different ID
    if (room.nameToID[name] && room.nameToID[name] !== playerID) {
      socket.emit("nameTaken", name);
      return;
    }

    room.nameToID[name] = playerID;

    if (!room.players[playerID]) {
      room.players[playerID] = { id: playerID, name, score: 0 };
    }

    socket.data.playerID = playerID;
    socket.join(roomId);

    socket.emit("joined", {
      playerID,
      gameOngoing: room.gameOngoing,
      activePlayers: Array.from(room.activePlayerIDs),
    });

    io.to(roomId).emit("roomState", {
      players: Object.values(room.players),
      gameOngoing: room.gameOngoing,
      startVotes: room.startVotes.size,
      endVotes: room.endVotes.size,
      totalPlayers: Object.keys(room.players).length,
      activePlayers: Array.from(room.activePlayerIDs),
    });
    io.to(roomId).emit("players", Object.values(room.players));
  });

  socket.on("startGame", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || room.gameOngoing) return;

    const playerID = socket.data.playerID;
    if (!playerID) return;

    room.startVotes.add(playerID);

    console.log("[startGame vote]", {
      roomId,
      voter: playerID,
      votes: room.startVotes.size,
      totalPlayers: Object.keys(room.players).length,
    });

    const total = Object.keys(room.players).length;

    if (room.startVotes.size === total) {
      room.gameOngoing = true;
      room.startVotes.clear();

      room.activePlayerIDs = new Set(Object.keys(room.players));

      console.log("[GAME STARTED]", {
        roomId,
        activePlayers: [...room.activePlayerIDs],
      });

      // reset scores
      for (const p of Object.values(room.players)) {
        p.score = 0;
      }

      io.to(roomId).emit("players", Object.values(room.players));
    }

    io.to(roomId).emit("roomState", {
      players: Object.values(room.players),
      gameOngoing: room.gameOngoing,
      startVotes: room.startVotes.size,
      endVotes: room.endVotes.size,
      totalPlayers: Object.keys(room.players).length,
      activePlayers: Array.from(room.activePlayerIDs),
    });
    socket.emit('youAre', playerID);
  });

  socket.on("endGame", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || !room.gameOngoing) return;

    const playerID = socket.data.playerID;
    if (!playerID || !room.activePlayerIDs.has(playerID)) return;

    room.endVotes.add(playerID);

    if (room.endVotes.size === room.activePlayerIDs.size) {
      room.gameOngoing = false;
      room.endVotes.clear();
      room.activePlayerIDs.clear();

      for (const p of Object.values(room.players)) {
        p.score = 0;
      }
    }

    io.to(roomId).emit("roomState", {
      players: Object.values(room.players),
      gameOngoing: room.gameOngoing,
      startVotes: room.startVotes.size,
      endVotes: room.endVotes.size,
      totalPlayers: Object.keys(room.players).length,
      activePlayers: Array.from(room.activePlayerIDs),
    });
  });

  socket.on("button1", (data: { roomId: string }) => {
    const roomId = data?.roomId;
    if (!roomId) return;

    const room = rooms[roomId];
    if (!room || !room.gameOngoing) return;

    const playerID = socket.data.playerID || socket.id;
    if (!room.activePlayerIDs.has(playerID)) return;

    room.everyoneClickedButton1.add(playerID);

    // All active players must click
    const allClicked = [...room.activePlayerIDs].every(id =>
      room.everyoneClickedButton1.has(id)
    );

    if (allClicked) {
      for (const id of room.activePlayerIDs) {
        room.players[id].score += 5;
      }

      room.everyoneClickedButton1.clear();
      io.to(roomId).emit("players", Object.values(room.players));
    }
  });


  socket.on("button2", (data: { roomId: string }) => {
    const roomId = data?.roomId;
    if (!roomId) return;

    const room = rooms[roomId];
    if (!room || !room.gameOngoing) return;

    const playerID = socket.data.playerID || socket.id;
    if (!room.activePlayerIDs.has(playerID)) return;

    room.players[playerID].score += 1;
    io.to(roomId).emit("players", Object.values(room.players));
  });


  socket.on("disconnecting", () => {
    const playerID = socket.data.playerID || socket.id;

    for (const roomId of socket.rooms) {
      if (roomId === socket.id) continue;

      const room = rooms[roomId];
      if (!room) continue;

      console.log("[disconnect cleanup]", { roomId, playerID });

      // remove from all state
      delete room.players[playerID];
      room.everyoneClickedButton1.delete(playerID);
      room.activePlayerIDs.delete(playerID);
      room.startVotes.delete(playerID);
      room.endVotes.delete(playerID);

      // remove name mapping
      for (const [name, id] of Object.entries(room.nameToID)) {
        if (id === playerID) {
          delete room.nameToID[name];
          break;
        }
      }

      // if game becomes empty, end it
      if (room.gameOngoing && room.activePlayerIDs.size === 0) {
        room.gameOngoing = false;
      }

      // broadcast updated room state
      io.to(roomId).emit("roomState", {
        players: Object.values(room.players),
        gameOngoing: room.gameOngoing,
        startVotes: room.startVotes.size,
        endVotes: room.endVotes.size,
        totalPlayers: Object.keys(room.players).length,
        activePlayers: Array.from(room.activePlayerIDs),
      });
    }
  });
});

httpServer.listen(3000, () => console.log("Server running on http://localhost:3000"));