/**
 * ProjectArtworks.tsx — PART B.2, B.3, B.8, B.10
 * ─────────────────────────────────────────────────────────────────────────────
 * Every artwork is hung by `artworkGroupCentre()` + the mount's own yaw, both of
 * which come from layout.ts. Consequences, all verified by
 * `scripts/verify-layout.mjs` before the scene even renders:
 *   • the canvas plane sits exactly ARTWORK_GROUP_OFFSET off the real wall face
 *   • the frame's back face is exactly 0.04 in front of that wall face
 *   • the front face points INTO the room, so nothing is ever seen from behind
 *   • TejaLens is on the upper gallery BACK wall at floorY + 3.0 = 8.2
 *   • the "DURVA" name plate is on the vestibule left wall, facing the entry
 *
 * Textures are generated lazily in an idle callback (PART B.8) and every
 * CanvasTexture gets `colorSpace = SRGBColorSpace` + `anisotropy = 8`.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  ARTWORK_BACK_DEPTH, ARTWORKS, cursorStore, INSTALLS, scrollStore,
  artworkGroupCentre, type ArtworkMount, type InstallDef,
} from './constants';
import { useArtworkTexture } from './artworkTextures';

const FRAME_T = 0.10;                    // gold moulding thickness
const FD = ARTWORK_BACK_DEPTH;           // 0.16 — frame + backing depth

// ─── One hung piece ─────────────────────────────────────────────────────────
function ArtworkFrame({ mount, install, onSelect }: {
  mount: ArtworkMount;
  install?: InstallDef;
  onSelect?: (d: InstallDef) => void;
}) {
  const tex = useArtworkTexture(mount.id);
  const groupRef = useRef<THREE.Group>(null);
  const nearRef = useRef(false);
  const [near, setNear] = useState(false);
  const [hovered, setHovered] = useState(false);

  const centre = useMemo(() => artworkGroupCentre(mount), [mount]);
  const w = mount.width;
  const h = mount.height;
  const yaw = mount.yaw;

  // "Near" is driven by the scroll window the camera spends on this piece —
  // read from the mutable store, so it never re-renders the canvas.
  useFrame(() => {
    if (!install) return;
    const t = scrollStore.testT ?? scrollStore.progress;
    const isNear = t >= install.activeRange[0] && t <= install.activeRange[1];
    if (isNear !== nearRef.current) {
      nearRef.current = isNear;
      setNear(isNear);
    }
  });

  // PART B.2 — the VIEW badge is offset along the artwork's OWN normal, not +Z.
  const n = mount.normal;
  const badgePos: [number, number, number] = [
    centre[0] + n[0] * 0.45,
    centre[1],
    centre[2] + n[2] * 0.45,
  ];

  const setView = (v: boolean) => {
    cursorStore.view = v;
    setHovered(v);
  };

  return (
    <>
      <group
        ref={groupRef}
        position={centre}
        rotation={[0, yaw, 0]}
        onClick={install && onSelect ? () => onSelect(install) : undefined}
        onPointerOver={install ? () => setView(true) : undefined}
        onPointerOut={install ? () => setView(false) : undefined}
      >
        {/* Backing panel — its rear face lands exactly 0.04 off the wall */}
        <mesh castShadow position={[0, 0, -FD / 2]}>
          <boxGeometry args={[w, h, FD]} />
          <meshStandardMaterial color={0x121010} roughness={0.94} metalness={0} />
        </mesh>

        {/* Gold moulding, outer rectangle (w + 2T) x (h + 2T) */}
        {([
          [0, h / 2 + FRAME_T / 2, [w + FRAME_T * 2, FRAME_T, FD]],
          [0, -h / 2 - FRAME_T / 2, [w + FRAME_T * 2, FRAME_T, FD]],
          [-w / 2 - FRAME_T / 2, 0, [FRAME_T, h, FD]],
          [w / 2 + FRAME_T / 2, 0, [FRAME_T, h, FD]],
        ] as [number, number, [number, number, number]][]).map(([x, y, size], i) => (
          <mesh key={i} castShadow position={[x, y, -FD / 2]}>
            <boxGeometry args={size} />
            <meshStandardMaterial color={0xB08F52} roughness={0.34} metalness={0.62} />
          </mesh>
        ))}

        {/* The canvas — FrontSide, so its normal is the room-facing one */}
        <mesh position={[0, 0, 0.006]}>
          <planeGeometry args={[w, h]} />
          {tex
            ? <meshStandardMaterial map={tex} roughness={0.8} metalness={0} side={THREE.FrontSide} />
            : <meshStandardMaterial color={0xB8AE9E} roughness={0.9} metalness={0} side={THREE.FrontSide} />}
        </mesh>

        {/* Forgiving pick target for the pointer */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[w + 0.5, h + 0.5]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.FrontSide} />
        </mesh>
      </group>
      {install && (
        <PieceLabels
          install={install}
          near={near}
          hovered={hovered}
          badgePos={badgePos}
          h={h}
        />
      )}
    </>
  );
}
// ─── Brass caption plaque + VIEW ring, both offset along the mount's normal ──
function PieceLabels({ install, near, hovered, badgePos, h }: {
  install: InstallDef;
  near: boolean;
  hovered: boolean;
  badgePos: [number, number, number];
  h: number;
}) {
  return (
    <>
      {near && (
        <Html
          position={[badgePos[0], badgePos[1] - h / 2 - 0.5, badgePos[2]]}
          center
          distanceFactor={10}
          style={{ pointerEvents: 'none' }}
        >
          <div style={{
            background: 'rgba(176,143,82,0.94)', padding: '5px 10px',
            fontFamily: '"Helvetica Neue",Inter,Arial,sans-serif',
            textAlign: 'center', minWidth: 120,
          }}>
            <div style={{ fontSize: 9, letterSpacing: '0.18em', color: '#1A1614', fontWeight: 600, textTransform: 'uppercase' }}>
              {install.title}
            </div>
            <div style={{ fontSize: 7.5, letterSpacing: '0.10em', color: 'rgba(26,22,20,0.65)', marginTop: 2, textTransform: 'uppercase' }}>
              {install.role}
            </div>
          </div>
        </Html>
      )}

      {hovered && (
        <Html position={badgePos} center distanceFactor={6} style={{ pointerEvents: 'none' }}>
          <div style={{
            width: 54, height: 54, borderRadius: '50%',
            border: '1px solid rgba(176,143,82,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Helvetica Neue",Inter,Arial,sans-serif',
            fontSize: 9, letterSpacing: '0.18em', color: '#F2EDE4',
            textTransform: 'uppercase', background: 'rgba(18,14,12,0.78)',
          }}>
            VIEW
          </div>
        </Html>
      )}
    </>
  );
}

export default function ProjectArtworks({ onSelect }: { onSelect: (d: InstallDef) => void }) {
  const installs = useMemo(() => new Map(INSTALLS.map(i => [i.mount.id, i])), []);
  return (
    <>
      {ARTWORKS.map(mount => (
        <ArtworkFrame
          key={mount.id}
          mount={mount}
          install={installs.get(mount.id)}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}