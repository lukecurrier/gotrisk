import { useState } from 'react';
import { useGame, type CardInfo } from '../context/GameContext';

const TYPE_COLORS: Record<string, string> = {
  Character: '#c084fc',
  Maester: '#60a5fa',
  Territory: '#4ade80',
  Victory: '#facc15',
};

const BREAKPOINT_OPTIONS: { key: string; label: string }[] = [
  { key: 'BeforeAnInvasion', label: 'Before invasion against you' },
  { key: 'BeforeABattle', label: 'Before battle against you' },
  { key: 'AfterRollingDiceForABattle', label: 'After dice rolled against you' },
  { key: 'OpponentPlaysAMaesterCard', label: 'When opponent plays Maester card' },
  { key: 'StartOfTurn', label: "Start of opponent's turn" },
];

export function PlayerPanel() {
  const { state, playCard, setAutoPass, setBreakpoints } = useGame();
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [autoPass, setAutoPassLocal] = useState(false);
  const [activeBreakpoints, setActiveBreakpoints] = useState<Set<string>>(new Set(['BeforeAnInvasion']));
  const [showSettings, setShowSettings] = useState(false);

  const selectedCard = state.hand.find(c => c.id === selectedCardId) ?? null;
  const iHavePriority = state.priorityPlayerId === state.playerId;
  const playableCards = state.hand.filter(c => c.isPlayable);

  // Group hand by type
  const grouped = new Map<string, CardInfo[]>();
  for (const c of state.hand) {
    if (!grouped.has(c.type)) grouped.set(c.type, []);
    grouped.get(c.type)!.push(c);
  }

  function handlePlayCard(card: CardInfo) {
    playCard(card.id);
    setSelectedCardId(null);
  }

  return (
    <div style={{
      width: '260px',
      background: 'var(--surface)',
      borderLeft: '1px solid var(--border)',
      padding: '0.75rem',
      overflow: 'auto',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      {/* Players */}
      <div>
        <h3 style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Players</h3>
        {state.players.map(p => {
          const isActive = p.id === state.activePlayerId;
          const isMe = p.id === state.playerId;
          return (
            <div key={p.id} style={{
              padding: '0.4rem',
              marginBottom: '0.3rem',
              borderRadius: '4px',
              border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: isMe ? 'rgba(233, 69, 96, 0.08)' : 'transparent',
              fontSize: '0.8rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: isActive ? 'bold' : 'normal' }}>
                  <span style={{
                    display: 'inline-block', width: 8, height: 8,
                    borderRadius: '50%', background: p.color || '#888', marginRight: '0.3rem',
                  }} />
                  {p.name}
                </span>
                {isMe && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>you</span>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--gold)' }}>{p.gold}g</span>
                <span>{p.victoryPoints}vp</span>
                <span>{p.territoryCount}t</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Troops to place */}
      {state.phase === 'Turn' && state.turnStep === 'Reinforce' && state.activePlayerId === state.playerId && (
        <div style={{
          padding: '0.4rem',
          borderRadius: '4px',
          background: 'rgba(212, 168, 67, 0.15)',
          border: '1px solid var(--gold)',
          fontSize: '0.8rem',
        }}>
          Troops to place: <strong>{state.troopsToPlace}</strong>
        </div>
      )}

      {/* Priority Settings */}
      <div>
        <div
          onClick={() => setShowSettings(!showSettings)}
          style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}
        >
          {showSettings ? '- Priority Settings' : '+ Priority Settings'}
        </div>
        {showSettings && (
          <div style={{ marginTop: '0.3rem', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.7rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', marginBottom: '0.3rem' }}>
              <input
                type="checkbox"
                checked={autoPass}
                onChange={(e) => {
                  setAutoPassLocal(e.target.checked);
                  setAutoPass(e.target.checked);
                }}
              />
              <span>Auto-pass all priority</span>
            </label>
            {autoPass && (
              <div style={{ marginTop: '0.3rem', paddingLeft: '0.2rem' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem', fontSize: '0.65rem' }}>
                  Breakpoints (stop auto-pass):
                </div>
                {BREAKPOINT_OPTIONS.map(bp => (
                  <label key={bp.key} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', marginBottom: '0.15rem' }}>
                    <input
                      type="checkbox"
                      checked={activeBreakpoints.has(bp.key)}
                      onChange={(e) => {
                        const next = new Set(activeBreakpoints);
                        if (e.target.checked) next.add(bp.key); else next.delete(bp.key);
                        setActiveBreakpoints(next);
                        setBreakpoints(Array.from(next));
                      }}
                    />
                    <span>{bp.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Detail Panel */}
      {selectedCard && (
        <div style={{
          padding: '0.6rem',
          borderRadius: '6px',
          border: `2px solid ${TYPE_COLORS[selectedCard.type] ?? 'var(--border)'}`,
          background: 'rgba(0,0,0,0.3)',
          fontSize: '0.8rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <strong style={{ color: TYPE_COLORS[selectedCard.type] }}>{selectedCard.name}</strong>
            <button
              onClick={() => setSelectedCardId(null)}
              style={{ fontSize: '0.65rem', padding: '0 0.3rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >X</button>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
            {selectedCard.type}
            {selectedCard.price != null && <span style={{ color: 'var(--gold)' }}> - {selectedCard.price}g</span>}
            {selectedCard.value != null && <span style={{ color: '#facc15' }}> - {selectedCard.value}vp</span>}
            {selectedCard.token && <span> - {selectedCard.token}</span>}
          </div>
          {selectedCard.timing && (
            <div style={{ fontSize: '0.7rem', color: '#f59e0b', marginBottom: '0.3rem' }}>
              {selectedCard.timing}
            </div>
          )}
          {selectedCard.description && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text)', lineHeight: 1.4 }}>
              {selectedCard.description}
            </div>
          )}
          {selectedCard.territory && (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Territory: {selectedCard.territory}
            </div>
          )}
          {selectedCard.isPlayable && (
            <button
              onClick={() => handlePlayCard(selectedCard)}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '0.35rem',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                background: TYPE_COLORS[selectedCard.type] ?? 'var(--accent)',
                color: '#111',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Play Card{selectedCard.price ? ` (${selectedCard.price}g)` : ''}
            </button>
          )}
        </div>
      )}

      {/* Hand */}
      <div>
        <h3 style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Hand ({state.hand.length})
          {iHavePriority && playableCards.length > 0 && (
            <span style={{
              marginLeft: '0.4rem',
              fontSize: '0.7rem',
              color: '#60a5fa',
              fontWeight: 'bold',
            }}>
              — {playableCards.length} playable
            </span>
          )}
        </h3>
        {state.hand.length === 0 && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No cards</div>
        )}
        {Array.from(grouped.entries()).map(([type, cards]) => (
          <div key={type} style={{ marginBottom: '0.4rem' }}>
            <div style={{ fontSize: '0.65rem', color: TYPE_COLORS[type] ?? 'var(--text-muted)', marginBottom: '0.2rem' }}>
              {type}
            </div>
            {cards.map(c => {
              const isSelected = c.id === selectedCardId;
              const playable = c.isPlayable;
              const highlightPlayable = playable && iHavePriority;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCardId(isSelected ? null : c.id)}
                  style={{
                    padding: '0.3rem 0.4rem',
                    marginBottom: '0.2rem',
                    borderRadius: '3px',
                    border: isSelected
                      ? `2px solid ${TYPE_COLORS[type] ?? 'var(--accent)'}`
                      : highlightPlayable
                        ? `2px solid ${TYPE_COLORS[type] ?? 'var(--accent)'}`
                        : playable
                          ? `1px solid ${TYPE_COLORS[type] ?? 'var(--border)'}`
                          : `1px solid var(--border)`,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    background: highlightPlayable
                      ? `${TYPE_COLORS[type]}30`
                      : playable ? `${TYPE_COLORS[type]}15` : 'transparent',
                    opacity: playable ? 1 : 0.7,
                    transition: 'all 0.15s',
                    boxShadow: highlightPlayable ? `0 0 8px ${TYPE_COLORS[type]}40` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{c.name}</span>
                    {playable && (
                      <span style={{
                        fontSize: '0.55rem',
                        padding: '0.1rem 0.3rem',
                        borderRadius: '3px',
                        background: TYPE_COLORS[type],
                        color: '#111',
                        fontWeight: 'bold',
                      }}>PLAY</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.1rem' }}>
                    {c.price != null && <span style={{ fontSize: '0.65rem', color: 'var(--gold)' }}>{c.price}g</span>}
                    {c.token && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{c.token}</span>}
                    {c.value != null && <span style={{ fontSize: '0.65rem', color: '#facc15' }}>{c.value}vp</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
