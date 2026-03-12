import { useEffect, useState } from 'react';
import { useGame, type SaveInfo } from '../context/GameContext';

export function Lobby() {
  const { state, ready, startGame, listSaves, loadSave } = useGame();
  const [showSaves, setShowSaves] = useState(false);

  const me = state.players.find(p => p.id === state.playerId);
  const allReady = state.players.length >= 2 && state.players.every(p => p.ready);

  // If a save is loaded, check if enough players have joined
  const expectedCount = state.expectedPlayers?.length ?? 0;
  const allExpectedJoined = state.expectedPlayers
    ? state.expectedPlayers.every(name => state.players.some(p => p.name === name))
    : true;

  useEffect(() => {
    if (showSaves) listSaves();
  }, [showSaves]);

  function handleLoadSave(save: SaveInfo) {
    loadSave(save.filename);
    setShowSaves(false);
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '1.5rem',
    }}>
      <h2>Lobby</h2>

      {state.expectedPlayers ? (
        <p style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>
          Loading saved game — waiting for: {state.expectedPlayers.filter(
            name => !state.players.some(p => p.name === name)
          ).join(', ') || 'all players joined!'}
        </p>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Waiting for players... ({state.players.length} joined)
        </p>
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        minWidth: '250px',
      }}>
        {state.players.map(p => (
          <div key={p.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 1rem',
            background: 'var(--surface)',
            borderRadius: '4px',
            border: p.id === state.playerId ? '1px solid var(--accent)' : '1px solid var(--border)',
          }}>
            <span>
              <span style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: p.color || '#888',
                marginRight: '0.5rem',
              }} />
              {p.name}
            </span>
            <span style={{ color: p.ready ? '#4ade80' : 'var(--text-muted)', fontSize: '0.8rem' }}>
              {p.ready ? 'Ready' : 'Not ready'}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {me && !me.ready && (
          <button onClick={ready}>Ready Up</button>
        )}
        {allReady && (
          <button
            onClick={startGame}
            style={{ background: 'var(--accent)', fontWeight: 'bold' }}
          >
            {state.expectedPlayers ? 'Resume Game' : 'Start Game'}
          </button>
        )}
        {!state.expectedPlayers && (
          <button
            onClick={() => setShowSaves(!showSaves)}
            style={{ fontSize: '0.85rem' }}
          >
            {showSaves ? 'Hide Saves' : 'Load Game'}
          </button>
        )}
      </div>

      {showSaves && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          minWidth: '300px',
          maxHeight: '200px',
          overflow: 'auto',
        }}>
          {state.saves.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
              No saved games found
            </div>
          ) : (
            state.saves.map(s => (
              <div
                key={s.filename}
                onClick={() => handleLoadSave(s)}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{s.playerNames.join(', ')}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                    {new Date(s.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
