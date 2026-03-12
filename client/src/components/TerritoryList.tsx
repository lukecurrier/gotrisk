import { useState } from 'react';
import { useGame } from '../context/GameContext';

export function TerritoryList() {
  const { state, dispatch, placeReinforcements, declareInvasion, maneuver } = useGame();

  const isMyTurn = state.activePlayerId === state.playerId;
  const step = state.turnStep;

  // Maneuver troop count prompt
  const [maneuverFrom, setManeuverFrom] = useState<string | null>(null);
  const [maneuverTo, setManeuverTo] = useState<string | null>(null);

  const fromTerritory = maneuverFrom ? state.territories.find(t => t.name === maneuverFrom) : null;
  const maxManeuver = fromTerritory ? fromTerritory.troops - 1 : 0;

  // Group territories by region
  const byRegion = new Map<string, typeof state.territories>();
  for (const t of state.territories) {
    const region = t.region || 'Unknown';
    if (!byRegion.has(region)) byRegion.set(region, []);
    byRegion.get(region)!.push(t);
  }

  const handleClick = (territoryName: string) => {
    if (!isMyTurn) return;

    const territory = state.territories.find(t => t.name === territoryName);
    if (!territory) return;

    // Reinforce: click own territory to add 1 troop
    if (step === 'Reinforce' && territory.owner === state.playerId && state.troopsToPlace > 0) {
      placeReinforcements(territoryName, 1);
      return;
    }

    // Attack: first click = select attacker, second click = select target
    if (step === 'DeclareInvasions') {
      if (!state.selectedTerritory) {
        if (territory.owner === state.playerId && territory.troops > 1) {
          dispatch({ type: 'SELECT_TERRITORY', name: territoryName });
        }
      } else if (state.selectedTerritory === territoryName) {
        dispatch({ type: 'SELECT_TERRITORY', name: null });
      } else {
        if (territory.owner !== state.playerId) {
          declareInvasion(state.selectedTerritory, territoryName);
          dispatch({ type: 'SELECT_TERRITORY', name: null });
        } else if (territory.troops > 1) {
          dispatch({ type: 'SELECT_TERRITORY', name: territoryName });
        }
      }
      return;
    }

    // Maneuver: first click = source, second click = destination (then prompt for troop count)
    if (step === 'Maneuver') {
      if (!state.selectedTerritory) {
        if (territory.owner === state.playerId && territory.troops > 1) {
          dispatch({ type: 'SELECT_TERRITORY', name: territoryName });
        }
      } else if (state.selectedTerritory === territoryName) {
        dispatch({ type: 'SELECT_TERRITORY', name: null });
      } else {
        if (territory.owner === state.playerId) {
          setManeuverFrom(state.selectedTerritory);
          setManeuverTo(territoryName);
          dispatch({ type: 'SELECT_TERRITORY', name: null });
        }
      }
      return;
    }

    dispatch({ type: 'SELECT_TERRITORY', name: territoryName });
  };

  const doManeuver = (troops: number) => {
    if (maneuverFrom && maneuverTo && troops > 0) {
      maneuver(maneuverFrom, maneuverTo, troops);
    }
    setManeuverFrom(null);
    setManeuverTo(null);
  };

  return (
    <div>
      {/* Maneuver troop prompt */}
      {maneuverFrom && maneuverTo && (
        <div style={{
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.85rem',
        }}>
          <span>Move troops from <strong>{maneuverFrom}</strong> to <strong>{maneuverTo}</strong>:</span>
          {Array.from({ length: maxManeuver }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => doManeuver(n)} style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>
              {n}
            </button>
          ))}
          <button onClick={() => doManeuver(0)} style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>
            Cancel
          </button>
        </div>
      )}

      {Array.from(byRegion.entries()).map(([regionName, territories]) => (
        <div key={regionName} style={{ marginBottom: '1.25rem' }}>
          <h4 style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginBottom: '0.4rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {regionName}
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.4rem',
          }}>
            {territories.map(t => {
              const isMine = t.owner === state.playerId;
              const isSelected = t.name === state.selectedTerritory;
              const ownerPlayer = state.players.find(p => p.id === t.owner);

              let clickable = false;
              if (isMyTurn) {
                if (step === 'Reinforce' && isMine && state.troopsToPlace > 0) clickable = true;
                if (step === 'DeclareInvasions') {
                  if (!state.selectedTerritory && isMine && t.troops > 1) clickable = true;
                  if (state.selectedTerritory && !isMine) clickable = true;
                  if (state.selectedTerritory === t.name) clickable = true;
                }
                if (step === 'Maneuver') {
                  if (!state.selectedTerritory && isMine && t.troops > 1) clickable = true;
                  if (state.selectedTerritory && isMine) clickable = true;
                  if (state.selectedTerritory === t.name) clickable = true;
                }
              }

              const dimmed = isMyTurn && state.selectedTerritory
                && (step === 'DeclareInvasions' && isMine && !isSelected)
                || (step === 'Maneuver' && state.selectedTerritory && !isMine && !isSelected);

              return (
                <div
                  key={t.name}
                  onClick={() => handleClick(t.name)}
                  style={{
                    padding: '0.5rem 0.6rem',
                    borderRadius: '4px',
                    border: isSelected
                      ? '2px solid var(--accent)'
                      : `1px solid ${ownerPlayer?.color ?? 'var(--border)'}`,
                    background: isSelected
                      ? 'rgba(233, 69, 96, 0.15)'
                      : isMine
                        ? 'rgba(255,255,255,0.04)'
                        : 'transparent',
                    cursor: clickable ? 'pointer' : 'default',
                    opacity: dimmed ? 0.5 : 1,
                    fontSize: '0.85rem',
                    transition: 'border 0.1s, background 0.1s, opacity 0.1s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: isMine ? 'bold' : 'normal' }}>{t.name}</span>
                    <span style={{
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      color: isMine ? 'var(--text)' : ownerPlayer?.color ?? 'var(--text-muted)',
                    }}>
                      {t.troops}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.15rem',
                  }}>
                    <span style={{ color: ownerPlayer?.color ?? 'var(--text-muted)' }}>
                      {ownerPlayer?.name ?? 'Unowned'}
                    </span>
                    <span>
                      {[
                        t.castle && 'Castle',
                        t.port && 'Port',
                        t.fortifications > 0 && `Fort`,
                        t.knights > 0 && `Knight`,
                        t.siegeEngines > 0 && `Siege`,
                      ].filter(Boolean).join(' | ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
