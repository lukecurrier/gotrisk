import { useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { JoinScreen } from './components/JoinScreen';
import { Lobby } from './components/Lobby';
import { GameBoard } from './components/GameBoard';

function AppInner() {
  const { state, dispatch } = useGame();

  // Auto-dismiss error messages after 3 seconds
  useEffect(() => {
    if (state.message) {
      const timer = setTimeout(() => dispatch({ type: 'SET_MESSAGE', message: null }), 2000);
      return () => clearTimeout(timer);
    }
  }, [state.message, dispatch]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {state.message && (
        <div
          onClick={() => dispatch({ type: 'SET_MESSAGE', message: null })}
          style={{
            background: '#e94560',
            color: 'white',
            padding: '0.5rem 1rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          {state.message}
        </div>
      )}

      {state.screen === 'join' && <JoinScreen />}
      {state.screen === 'lobby' && <Lobby />}
      {state.screen === 'game' && <GameBoard />}
    </div>
  );
}

export function App() {
  return (
    <GameProvider>
      <AppInner />
    </GameProvider>
  );
}
