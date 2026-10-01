import { useMemo } from 'react';
import * as THREE from 'three';
import { MAT, SPACES, makeMat } from './constants';

export default function EntranceHall() {
  const mStone   = useMemo(() => makeMat(MAT.stone),   []);
  const mDark    = useMemo(() => makeMat(MAT.stoneDark),[]);
  const mFloor   = useMemo(() => makeMat(MAT.floor),   []);
  const mCeil    = useMemo(() => makeMat(MAT.ceiling),  []);
  const mMetal   = useMemo(() => makeMat(MAT.metal),   []);
  const mGold    = useMemo(() => makeMat(MAT.gold),    []);

  const { w, h, d, cz } = SPACES.entrance;
  const hw = w / 2;
  const hh = h / 2;
  const hd = d / 2;
  const t  = 0.28; // wall thickness

  // Arch opening into atrium: 5.5 wide, 4.2 tall, centred on front wall
  const archW = 5.5;
  const archH = 4.2;

  // Front wall with arch cutout — built as two side panels + lintel
  const sideW = (w - archW) / 2;

  return (
    <group position={[0, 0, cz]}>
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

      {/* Back wall (entrance side) */}
      <mesh receiveShadow castShadow position={[0, hh, hd]}>
        <boxGeometry args={[w, h, t]} />
        <primitive object={mStone} attach="material" />
      </mesh>

      {/* Left wall */}
      <mesh receiveShadow castShadow position={[-hw, hh, 0]}>
        <boxGeometry args={[t, h, d]} />
        <primitive object={mStone} attach="material" />
      </mesh>

      {/* Right wall */}
      <mesh receiveShadow castShadow position={[hw, hh, 0]}>
        <boxGeometry args={[t, h, d]} />
        <primitive object={mStone} attach="material" />
      </mesh>

      {/* Front wall — left panel beside arch */}
      <mesh receiveShadow castShadow position={[-(archW / 2 + sideW / 2), hh, -hd]}>
        <boxGeometry args={[sideW, h, t]} />
        <primitive object={mStone} attach="material" />
      </mesh>

      {/* Front wall — right panel beside arch */}
      <mesh receiveShadow castShadow position={[(archW / 2 + sideW / 2), hh, -hd]}>
        <boxGeometry args={[sideW, h, t]} />
        <primitive object={mStone} attach="material" />
      </mesh>

      {/* Front wall — lintel above arch */}
      <mesh receiveShadow castShadow position={[0, archH + (h - archH) / 2, -hd]}>
        <boxGeometry args={[archW, h - archH, t]} />
        <primitive object={mStone} attach="material" />
      </mesh>

      {/* Arch reveal depth — jambs left */}
      <mesh castShadow position={[-(archW / 2) + t / 2, archH / 2, -hd]}>
        <boxGeometry args={[t, archH, 0.6]} />
        <primitive object={mDark} attach="material" />
      </mesh>
      {/* Arch reveal depth — jambs right */}
      <mesh castShadow position={[(archW / 2) - t / 2, archH / 2, -hd]}>
        <boxGeometry args={[t, archH, 0.6]} />
        <primitive object={mDark} attach="material" />
      </mesh>

      {/* Gold skirting — left wall */}
      <mesh position={[-hw + 0.02, 0.05, 0]}>
        <boxGeometry args={[0.05, 0.1, d]} />
        <primitive object={mGold} attach="material" />
      </mesh>
      {/* Gold skirting — right wall */}
      <mesh position={[hw - 0.02, 0.05, 0]}>
        <boxGeometry args={[0.05, 0.1, d]} />
        <primitive object={mGold} attach="material" />
      </mesh>

      {/* Thin metal column flanking arch — left */}
      <mesh castShadow position={[-(archW / 2) - 0.18, h / 2, -hd + 0.05]}>
        <boxGeometry args={[0.22, h, 0.22]} />
        <primitive object={mMetal} attach="material" />
      </mesh>
      {/* Thin metal column flanking arch — right */}
      <mesh castShadow position={[(archW / 2) + 0.18, h / 2, -hd + 0.05]}>
        <boxGeometry args={[0.22, h, 0.22]} />
        <primitive object={mMetal} attach="material" />
      </mesh>

      {/* Gold cap on arch columns */}
      <mesh position={[-(archW / 2) - 0.18, h - 0.06, -hd + 0.05]}>
        <boxGeometry args={[0.3, 0.12, 0.3]} />
        <primitive object={mGold} attach="material" />
      </mesh>
      <mesh position={[(archW / 2) + 0.18, h - 0.06, -hd + 0.05]}>
        <boxGeometry args={[0.3, 0.12, 0.3]} />
        <primitive object={mGold} attach="material" />
      </mesh>
    </group>
  );
}
