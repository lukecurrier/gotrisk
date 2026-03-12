import { useEffect } from 'react';
import { useGame, type TurnStepName } from '../context/GameContext';

const STEP_LABELS: Record<TurnStepName, string> = {
  StartOfTurn: 'Start',
  TurnInTerritoryCards: 'Cards',
  Reinforce: 'Reinforce',
  BuyCards: 'Buy',
  DeclareInvasions: 'Attack',
  Maneuver: 'Maneuver',
  TurnInVictoryCards: 'Victory',
  EndOfTurn: 'End',
};

const STEP_HINTS: Record<TurnStepName, string> = {
  StartOfTurn: '',
  TurnInTerritoryCards: 'Turn in territory card sets, or press Space to skip.',
  Reinforce: 'Click your territories to place troops. Space to skip.',
  BuyCards: 'Draw cards below, or press Space to skip.',
  DeclareInvasions: 'Click your territory, then an enemy. Space to skip.',
  Maneuver: 'Move troops between friendly territories. Space to skip.',
  TurnInVictoryCards: 'Cash in victory cards. Space to skip.',
  EndOfTurn: 'Press Space to end your turn.',
};

const STEP_ORDER: TurnStepName[] = [
  'TurnInTerritoryCards',
  'Reinforce',
  'BuyCards',
  'DeclareInvasions',
  'Maneuver',
  'TurnInVictoryCards',
  'EndOfTurn',
];

export function PhaseBar() {
  const { state, finishStep, drawCard, passPriority, undo, saveGame } = useGame();
  const isMyTurn = state.activePlayerId === state.playerId;
  const activePlayer = state.players.find(p => p.id === state.activePlayerId);
  const hint = isMyTurn && state.turnStep ? STEP_HINTS[state.turnStep] : null;

  const iHavePriority = state.priorityPlayerId === state.playerId;
  const someoneHasPriority = state.priorityPlayerId != null;
  const priorityPlayer = state.players.find(p => p.id === state.priorityPlayerId);
  const playableCount = state.hand.filter(c => c.isPlayable).length;

  // Spacebar to advance step (only if no priority pending)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
        e.preventDefault();

        if (iHavePriority) {
          passPriority();
        } else if (isMyTurn && state.phase === 'Turn' && !someoneHasPriority) {
          finishStep();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMyTurn, state.phase, finishStep, iHavePriority, someoneHasPriority, passPriority]);

  return (
    <div style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
    }}>
      {/* Priority banner */}
      {someoneHasPriority && (
        <div style={{
          padding: '0.4rem 1rem',
          background: iHavePriority ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255,255,255,0.05)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.85rem',
        }}>
          {iHavePriority ? (
            <>
              <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>
                You have priority
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                {playableCount > 0
                  ? `${playableCount} playable card${playableCount !== 1 ? 's' : ''} — click one in your hand or pass.`
                  : 'No playable cards — pass to continue.'}
              </span>
              <button
                onClick={passPriority}
                style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
              >
                Pass
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>[space]</span>
              </button>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>
              Waiting for <strong style={{ color: priorityPlayer?.color ?? 'var(--text)' }}>{priorityPlayer?.name ?? '...'}</strong> to respond...
            </span>
          )}
        </div>
      )}

      {/* Step indicator row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
      }}>
        <span style={{
          fontWeight: 'bold',
          color: activePlayer?.color || 'var(--text)',
          marginRight: '0.5rem',
          minWidth: '80px',
        }}>
          {activePlayer?.name ?? '...'}
        </span>

        {state.phase === 'Turn' && state.turnStep && (
          <>
            {STEP_ORDER.map(step => {
              const isCurrent = step === state.turnStep;
              const idx = STEP_ORDER.indexOf(step);
              const currentIdx = state.turnStep ? STEP_ORDER.indexOf(state.turnStep) : -1;
              const isPast = idx < currentIdx;

              return (
                <div key={step} style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: '3px',
                  fontSize: '0.8rem',
                  background: isCurrent ? 'var(--accent)' : isPast ? 'var(--border)' : 'transparent',
                  color: isCurrent ? '#fff' : 'var(--text-muted)',
                  border: isCurrent ? 'none' : '1px solid var(--border)',
                }}>
                  {STEP_LABELS[step]}
                </div>
              );
            })}

            {isMyTurn && !someoneHasPriority && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <button
                  onClick={saveGame}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', opacity: 0.7 }}
                  title="Save game"
                >
                  Save
                </button>
                <button
                  onClick={undo}
                  disabled={!state.canUndo}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', opacity: state.canUndo ? 0.7 : 0.3 }}
                  title="Undo last action"
                >
                  Undo
                </button>
                <button
                  onClick={finishStep}
                  style={{ fontSize: '0.8rem' }}
                >
                  {state.turnStep === 'EndOfTurn' ? 'End Turn' : 'Skip / Next'}
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>[space]</span>
                </button>
              </div>
            )}
          </>
        )}

        {state.phase === 'Invasion' && (
          <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>INVASION</span>
        )}
      </div>

      {/* Hint + buy buttons row */}
      {isMyTurn && state.phase === 'Turn' && !someoneHasPriority && (
        <div style={{
          padding: '0.25rem 1rem 0.5rem',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          {hint && (
            <span style={{ color: 'var(--gold)' }}>
              {hint}
              {state.turnStep === 'Reinforce' && ` (${state.troopsToPlace} remaining)`}
            </span>
          )}

          {state.turnStep === 'BuyCards' && (
            <div style={{ display: 'flex', gap: '0.4rem', marginLeft: 'auto' }}>
              <button onClick={() => drawCard('Maester')} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                + Maester (200g)
              </button>
              <button
                onClick={() => drawCard('Victory')}
                disabled={state.victoryBoughtThisTurn}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  opacity: state.victoryBoughtThisTurn ? 0.4 : 1,
                }}
              >
                {state.victoryBoughtThisTurn ? 'Victory (bought)' : '+ Victory (200g)'}
              </button>
            </div>
          )}
        </div>
      )}

      {state.lastSaveMessage && (
        <div style={{ padding: '0.25rem 1rem', fontSize: '0.75rem', color: '#4ade80' }}>
          {state.lastSaveMessage}
        </div>
      )}
    </div>
  );
}
