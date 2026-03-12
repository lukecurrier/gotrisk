# GoTRisk

A Game of Thrones-themed multiplayer Risk variant. Express + Socket.io server with a React + Vite client.

## Running locally (development)

Two terminals — Vite provides hot reload for the client, the server watches for changes.

**Server** (runs on :3000):
```
npm install
npm run dev
```

**Client** (runs on :5173, proxies Socket.io to :3000):
```
cd client
npm install
npm run dev
```

Open http://localhost:5173 in two browser windows (one regular, one private) and join with different names to test.

You can also use **ngrok http 5173** to send a remote tunnel to a local server.

## Production / deployment

A single command builds the client and starts the server. Express serves the built React app and handles WebSocket connections on one port.

```
npm install && cd client && npm install && cd ..
npm start
```

Open http://localhost:3000. The `PORT` env var is respected if set by your hosting platform.

To deploy, point Railway / Render / Fly.io at the repo. They'll run `npm install` and `npm start` automatically. The only env var you might set is `PORT` (most platforms inject it).

## Project structure

```
server/
  gameServer.ts        # Authoritative server — validates actions, broadcasts state, serves client build

client/src/
  socket.ts                # Shared Socket.io client instance (relative URL — works in dev and prod)
  context/GameContext.tsx   # React context + socket wiring, all client state
  components/              # UI: GameBoard, PhaseBar, PlayerPanel, TerritoryList, InvasionDialog, etc.
  game/                    # Shared game logic (imported by both server and client)
    GameManager.ts         # Singleton orchestrator — players, phases, decks, territories
    GamePhase.ts           # Phase state machine: Init → Setup → TurnPhase (with TurnSteps) → InvasionPhase
    Player.ts              # Player state: gold, VP, territories, cards
    Cards.ts               # Card class hierarchy: PlayableCard, VictoryCard, TerritoryCard, Deck
    CardCheck.ts           # Predicates for card playability (timing, gold, ownership)
    MaesterCards.ts        # Maester card definitions
    CharacterCards.ts      # Character card definitions
    LobbyManager.ts        # GameSettings constructor (board, decks)
    Board/                 # Board → Continent → Region → Territory
  utils/
    types.ts               # Enums (Token, GameTimeMarker) — zero-import file to avoid circular deps
    Utils.ts               # Board/deck builders, BattleResult, dice
    CardDescriptions.ts    # Static card description lookup
    Essos.ts, CharactersToUse.ts, MaesterCardsToUse.ts, VictoryCardsToUse.ts  # Data files
```

## Game flow

Each turn follows these steps in order: **TurnInTerritoryCards → Reinforce → BuyCards → DeclareInvasions → Maneuver → TurnInVictoryCards → EndOfTurn**. Steps with nothing to do are auto-skipped.

Invasions branch into an InvasionPhase (fight/retreat loop), then return to DeclareInvasions.

An MTGO-style priority system pauses the game at trigger moments (e.g. before an invasion) to let players with playable cards respond or pass.

## Design notes

- Server is authoritative — clients send intents, server validates and broadcasts. Game logic lives in `client/src/game/` so it can be shared, but the server is the source of truth.
- In dev, Vite proxies `/socket.io` to the Express server. In production, Express serves the static build directly so no proxy is needed.
- Undo restores to the beginning of the current turn step (click again for previous step).
- Card effects are mostly stubs (`(player) => null`) — definitions exist but implementations are pending.
- Victory card conditions (`VictoryCardChecks.ts`) are also unimplemented.

## Todo

https://docs.google.com/document/d/11F9pi3juRR3_3SP2w4H_Y5QNOZsLtPuMPfUkvUizG9E/edit?tab=t.0
