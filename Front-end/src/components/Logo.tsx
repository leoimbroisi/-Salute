import '../App.css';
import logoImage from '../assets/salute-logo.png';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

function Logo({ size = 'medium', showText = true }: LogoProps) {
  const sizeMap = {
    small: { width: 45, height: 45, fontSize: '16px' },
    medium: { width: 100, height: 100, fontSize: '22px' },
    large: { width: 200, height: 200, fontSize: '32px' },
  };

  const dimensions = sizeMap[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <img
        src={logoImage}
        alt="+SALUTE Logo"
        width={dimensions.width}
        height={dimensions.height}
        style={{ objectFit: 'contain' }}
      />

    </div>
  );
}

export default Logo;

