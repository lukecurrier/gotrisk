import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { MapCreator } from "../client/src/utils/Utils";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static("client")); // serve client files

type Player = { id: string; name: string; score: number };
type Room = {
  id: string;
  players: Record<string, Player>;
  nameToID: Record<string, string>;
  everyoneClickedButton1: Set<string>;
};

const rooms: Record<string, Room> = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinGame", (data: { roomId: string; name: string; playerID?: string }) => {
  const { roomId, name, playerID: clientID } = data || {};
  if (!roomId || !name) return;

  if (!rooms[roomId]) {
    rooms[roomId] = { id: roomId, players: {}, nameToID: {}, everyoneClickedButton1: new Set() };
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

  socket.emit("joined", { playerID }); // tell client their ID
  io.to(roomId).emit("players", Object.values(room.players));
});


  socket.on("button1", (data: { roomId: string }) => {
    const roomId = data?.roomId;
    if (!roomId) return;
    const room = rooms[roomId];
    if (!room) return;

    const playerID = socket.data.playerID || socket.id;
    room.everyoneClickedButton1.add(playerID);

    // Give +5 to everyone if all connected players clicked
    if (Object.keys(room.players).every(id => room.everyoneClickedButton1.has(id))) {
      for (const player of Object.values(room.players)) {
        player.score += 5;
      }
      room.everyoneClickedButton1.clear();
      io.to(roomId).emit("players", Object.values(room.players));
    }
  });

  socket.on("button2", (data: { roomId: string }) => {
    const roomId = data?.roomId;
    if (!roomId) return;
    const room = rooms[roomId];
    if (!room) return;

    const playerID = socket.data.playerID || socket.id;
    room.players[playerID]!.score += 1;
    io.to(roomId).emit("players", Object.values(room.players));
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (roomId === socket.id) continue;
      const room = rooms[roomId];
      if (room) {
        room.everyoneClickedButton1.delete(socket.data.playerID || socket.id);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(3000, () => console.log("Server running on http://localhost:3000"));
/*httpServer.listen(3000, () => experimentation());

function experimentation() {
  
  let mc: MapCreator = new MapCreator();
  mc.createFrom("client\\src\\utils\\mapname.txt");
}*/

