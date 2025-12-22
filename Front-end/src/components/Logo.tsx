import '../App.css';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

function Logo({ size = 'medium', showText = true }: LogoProps) {
  const sizeMap = {
    small: { width: 45, height: 45, fontSize: '16px' },
    medium: { width: 60, height: 60, fontSize: '22px' },
    large: { width: 90, height: 90, fontSize: '32px' },
  };

  const dimensions = sizeMap[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cruz médica - braço vertical com maior contraste */}
        <rect x="35" y="10" width="30" height="80" fill="#0056b3" />
        <rect x="35" y="10" width="15" height="80" fill="#003d82" />
        
        {/* Cruz médica - braço horizontal com maior contraste */}
        <rect x="10" y="35" width="80" height="30" fill="#0056b3" />
        <rect x="10" y="35" width="80" height="15" fill="#003d82" />
        
        {/* Linha de ECG (eletrocardiograma) em vermelho e mais fina */}
        <path
          d="M 20 50 L 25 45 L 30 50 L 35 40 L 40 50 L 45 55 L 50 50 L 55 45 L 60 50 L 65 40 L 70 50 L 75 55 L 80 50"
          stroke="#dc3545"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span
          style={{
            color: '#0056b3',
            fontWeight: 'bold',
            fontSize: dimensions.fontSize,
            fontFamily: 'sans-serif',
            letterSpacing: '1px',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          +SALUTE
        </span>
      )}
    </div>
  );
}

export default Logo;

