import { useGame } from '../context/GameContext';
import { PhaseBar } from './PhaseBar';
import { PlayerPanel } from './PlayerPanel';
import { TerritoryList } from './TerritoryList';
import { InvasionDialog } from './InvasionDialog';
import { VictoryChoiceDialog } from './VictoryChoiceDialog';

export function GameBoard() {
  const { state } = useGame();

  const isMyTurn = state.activePlayerId === state.playerId;
  const waitingFor = state.players.find(p => p.id === state.activePlayerId)?.name;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      <PhaseBar />

      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}>
        {/* Main board area */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '1rem',
        }}>
          {!isMyTurn && (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}>
              Waiting for <strong style={{ color: 'var(--text)' }}>{waitingFor}</strong>'s turn...
            </div>
          )}

          <TerritoryList />
        </div>

        {/* Side panel */}
        <PlayerPanel />
      </div>

      {/* Invasion overlay */}
      {state.attackingTerritory && state.defendingTerritory && <InvasionDialog />}

      {/* Victory card choice overlay */}
      <VictoryChoiceDialog />
    </div>
  );
}
