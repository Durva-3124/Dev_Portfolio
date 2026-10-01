import { useMemo } from 'react';
import { MAT, SPACES, makeMat } from './constants';

function Wing({
  cx, side,
}: {
  cx: number;
  side: 'left' | 'right';
}) {
  const mStone   = useMemo(() => makeMat(MAT.stone),    []);
  const mFloor   = useMemo(() => makeMat(MAT.floor),    []);
  const mCeil    = useMemo(() => makeMat(MAT.ceiling),   []);
  const mMetal   = useMemo(() => makeMat(MAT.metal),    []);
  const mGold    = useMemo(() => makeMat(MAT.gold),     []);
  const mExhibit = useMemo(() => makeMat(MAT.exhibit),  []);

  const { w, h, d } = SPACES.leftWing; // same dims for both
  const hw = w / 2;
  const hd = d / 2;
  const t  = 0.28;
  const sign = side === 'left' ? -1 : 1;

  return (
    <group position={[cx, 0, 0]}>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <primitive object={mFloor} attach="material" />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, h, 0]}>
        <planeGeometry args={[w, d]} />
        <primitive object={mCeil} attach="material" />
      </mesh>
      {/* Outer wall */}
      <mesh receiveShadow castShadow position={[sign * hw, h / 2, 0]}>
        <boxGeometry args={[t, h, d]} />
        <primitive object={mStone} attach="material" />
      </mesh>
      {/* Back wall */}
      <mesh receiveShadow castShadow position={[0, h / 2, -hd]}>
        <boxGeometry args={[w, h, t]} />
        <primitive object={mStone} attach="material" />
      </mesh>
      {/* Front wall */}
      <mesh receiveShadow castShadow position={[0, h / 2, hd]}>
        <boxGeometry args={[w, h, t]} />
        <primitive object={mStone} attach="material" />
      </mesh>

      {/* Exhibit wall on outer wall */}
      <mesh receiveShadow position={[sign * (hw - 0.32), 4, 0]}>
        <planeGeometry args={[8, 5]} />
        <primitive object={mExhibit} attach="material" />
      </mesh>
      {/* Frame */}
      <mesh position={[sign * (hw - 0.3), 4, 0]}>
        <boxGeometry args={[0.06, 5.2, 0.08]} />
        <primitive object={mGold} attach="material" />
      </mesh>

      {/* Single structural pier in wing */}
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[0.7, h, 0.7]} />
        <primitive object={mMetal} attach="material" />
      </mesh>
      <mesh position={[0, h - 0.06, 0]}>
        <boxGeometry args={[0.86, 0.12, 0.86]} />
        <primitive object={mGold} attach="material" />
      </mesh>

      {/* Gold skirting */}
      <mesh position={[sign * hw - sign * 0.02, 0.06, 0]}>
        <boxGeometry args={[0.05, 0.12, d]} />
        <primitive object={mGold} attach="material" />
      </mesh>
    </group>
  );
}

export default function GalleryWings() {
  return (
    <>
      <Wing cx={SPACES.leftWing.cx}  side="left"  />
      <Wing cx={SPACES.rightWing.cx} side="right" />
    </>
  );
}
