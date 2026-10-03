import { Html } from '@react-three/drei';

interface WallLabelProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  roomNum: string;
  title: string;
  distanceFactor?: number;
}

export function WallLabel({ position, rotation = [0,0,0], roomNum, title, distanceFactor = 14 }: WallLabelProps) {
  return (
    <Html
      position={position}
      rotation={rotation}
      center
      distanceFactor={distanceFactor}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      <div style={{
        fontFamily: '"Helvetica Neue", Inter, Arial, sans-serif',
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}>
        <div style={{
          fontSize: 9,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: '#6F1028',
          marginBottom: 6,
          fontWeight: 400,
        }}>
          {roomNum}
        </div>
        <div style={{
          fontSize: 22,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#2A2420',
          fontWeight: 200,
          lineHeight: 1.1,
        }}>
          {title}
        </div>
        <div style={{
          width: 32,
          height: 1,
          background: '#6F1028',
          margin: '8px auto 0',
        }} />
      </div>
    </Html>
  );
}

interface MuseumLabelProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  heading: string;
  body: string;
  distanceFactor?: number;
}

export function MuseumLabel({ position, rotation = [0,0,0], heading, body, distanceFactor = 10 }: MuseumLabelProps) {
  return (
    <Html
      position={position}
      rotation={rotation}
      distanceFactor={distanceFactor}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      <div style={{
        fontFamily: '"Helvetica Neue", Inter, Arial, sans-serif',
        maxWidth: 260,
        background: 'rgba(242,237,228,0.92)',
        padding: '12px 16px',
        borderLeft: '2px solid #6F1028',
      }}>
        <div style={{
          fontSize: 9,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#6F1028',
          marginBottom: 6,
          fontWeight: 500,
        }}>
          {heading}
        </div>
        <div style={{
          fontSize: 11,
          lineHeight: 1.65,
          color: '#2A2420',
          fontWeight: 300,
        }}>
          {body}
        </div>
      </div>
    </Html>
  );
}
