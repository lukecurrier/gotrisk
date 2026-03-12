import { useGame } from '../context/GameContext';

export function InvasionDialog() {
  const { state, fight, retreat } = useGame();

  if (!state.attackingTerritory || !state.defendingTerritory) return null;

  const attacker = state.territories.find(t => t.name === state.attackingTerritory);
  const defender = state.territories.find(t => t.name === state.defendingTerritory);
  if (!attacker || !defender) return null;

  const isAttacker = attacker.owner === state.playerId;
  const isDefender = defender.owner === state.playerId;
  const attackerPlayer = state.players.find(p => p.id === attacker.owner);
  const defenderPlayer = state.players.find(p => p.id === defender.owner);

  const maxAttackers = Math.min(3, attacker.troops - 1);
  const conquered = state.lastBattle?.conquered ?? false;
  const priorityPending = state.priorityPlayerId != null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      zIndex: 100,
    }}>
      <div style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '1.5rem',
        minWidth: '380px',
        maxWidth: '480px',
      }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--accent)', textAlign: 'center' }}>
          {conquered ? 'Territory Conquered!' : 'Battle'}
        </h3>

        {/* Territory matchup */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          gap: '1rem',
        }}>
          <div style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '4px',
            border: `1px solid ${attackerPlayer?.color ?? 'var(--border)'}`,
            background: isAttacker ? 'rgba(233, 69, 96, 0.08)' : 'transparent',
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Attacker</div>
            <div style={{ fontWeight: 'bold', color: attackerPlayer?.color }}>{attackerPlayer?.name}</div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{attacker.name}</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Troops: <strong>{attacker.troops}</strong></div>
          </div>

          <div style={{ alignSelf: 'center', fontSize: '1.2rem', color: 'var(--text-muted)' }}>vs</div>

          <div style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '4px',
            border: `1px solid ${defenderPlayer?.color ?? 'var(--border)'}`,
            background: isDefender ? 'rgba(74, 222, 128, 0.08)' : 'transparent',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Defender</div>
            <div style={{ fontWeight: 'bold', color: defenderPlayer?.color }}>{defenderPlayer?.name}</div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{defender.name}</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Troops: <strong>{defender.troops}</strong></div>
          </div>
        </div>

        {/* Battle result */}
        {state.lastBattle && (
          <div style={{
            padding: '0.75rem',
            background: 'var(--surface)',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.85rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: attackerPlayer?.color }}>
                Rolled: [{state.lastBattle.attackerRolls.join(', ')}]
              </span>
              <span style={{ color: defenderPlayer?.color }}>
                Rolled: [{state.lastBattle.defenderRolls.join(', ')}]
              </span>
            </div>
            <div style={{ marginTop: '0.4rem', textAlign: 'center' }}>
              Attacker lost <strong>{state.lastBattle.attackerLosses}</strong>
              {' | '}
              Defender lost <strong>{state.lastBattle.defenderLosses}</strong>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {isAttacker && !conquered && maxAttackers > 0 && !priorityPending && (
            <>
              {[1, 2, 3].filter(n => n <= maxAttackers).map(n => (
                <button
                  key={n}
                  onClick={() => fight(n, Math.min(2, defender.troops))}
                  style={{ background: 'var(--accent)', minWidth: '100px' }}
                >
                  Attack with {n}
                </button>
              ))}
            </>
          )}

          {isAttacker && !priorityPending && (
            <button onClick={retreat} style={{ minWidth: '100px' }}>
              {conquered ? 'Done' : maxAttackers <= 0 ? 'Withdraw' : 'Retreat'}
            </button>
          )}

          {isAttacker && priorityPending && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem' }}>
              Waiting for priority response...
            </div>
          )}

          {isDefender && !conquered && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem' }}>
              Defending... waiting for attacker.
            </div>
          )}

          {!isAttacker && !isDefender && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem' }}>
              Watching battle...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
