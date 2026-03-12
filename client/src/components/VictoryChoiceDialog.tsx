import { useGame, type CardInfo } from '../context/GameContext';

export function VictoryChoiceDialog() {
  const { state, chooseVictoryCard } = useGame();

  if (state.victoryChoices.length === 0) return null;

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
        minWidth: '400px',
        maxWidth: '520px',
      }}>
        <h3 style={{ marginBottom: '0.5rem', color: '#facc15', textAlign: 'center' }}>
          Choose a Victory Card
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1rem' }}>
          Pick one card to add to your hand. The other returns to the deck.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {state.victoryChoices.map((card: CardInfo) => (
            <button
              key={card.id}
              onClick={() => chooseVictoryCard(card.id)}
              style={{
                flex: 1,
                padding: '1rem',
                background: 'var(--surface)',
                border: '2px solid var(--border)',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#facc15')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{ fontWeight: 'bold', color: '#facc15', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                {card.name}
              </div>
              {card.value != null && (
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#facc15', marginBottom: '0.5rem' }}>
                  {card.value} VP
                </div>
              )}
              {card.description && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {card.description}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
