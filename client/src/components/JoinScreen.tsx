import { useState } from 'react';
import { useGame } from '../context/GameContext';

export function JoinScreen() {
  const { state, join } = useGame();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) join(trimmed);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '1.5rem',
    }}>
      <h1 style={{ fontSize: '2.5rem', letterSpacing: '0.1em' }}>GoTRisk</h1>
      <p style={{ color: 'var(--text-muted)' }}>
        {state.connected ? 'Connected to server' : 'Connecting...'}
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={!state.connected}
          autoFocus
        />
        <button type="submit" disabled={!state.connected || !name.trim()}>
          Join Game
        </button>
      </form>
    </div>
  );
}
