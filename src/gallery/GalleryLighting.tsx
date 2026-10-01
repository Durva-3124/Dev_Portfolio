import { LIGHT, SPACES } from './constants';

// ─── Atrium skylight simulation ───────────────────────────────────────────────
// Large area-like lights high in the atrium ceiling, warm neutral
function AtriumSkyLights() {
  const { h, cz } = SPACES.atrium;
  const positions: [number, number, number][] = [
    [-8,  h - 0.5, cz - 8],
    [ 8,  h - 0.5, cz - 8],
    [ 0,  h - 0.5, cz + 4],
    [-6,  h - 0.5, cz + 10],
    [ 6,  h - 0.5, cz + 10],
  ];
  return (
    <>
      {positions.map(([x, y, z], i) => (
        <pointLight
          key={i}
          position={[x, y, z]}
          color={LIGHT.warmWhite}
          intensity={22}
          distance={20}
          decay={2}
          castShadow={i === 0}
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
          shadow-camera-near={0.5}
          shadow-camera-far={22}
          shadow-bias={-0.001}
        />
      ))}
    </>
  );
}

// ─── Exhibit spotlights — aimed at the three exhibit walls ───────────────────
function ExhibitSpotlights() {
  const { h, cz } = SPACES.atrium;
  const hd = SPACES.atrium.d / 2;
  const hw = SPACES.atrium.w / 2;

  return (
    <>
      {/* Panoramic back wall */}
      <spotLight
        position={[0, h - 1.5, cz - hd + 6]}
        target-position={[0, 5.5, cz - hd + 0.5]}
        color={LIGHT.warmWhite}
        intensity={60}
        angle={0.38}
        penumbra={0.5}
        distance={18}
        decay={2}
        castShadow={false}
      />
      {/* Portrait wall — left */}
      <spotLight
        position={[-hw + 5, h - 2, cz - 8]}
        target-position={[-hw + 0.5, 5.5, cz - 8]}
        color={LIGHT.warmWhite}
        intensity={45}
        angle={0.42}
        penumbra={0.6}
        distance={14}
        decay={2}
        castShadow={false}
      />
      {/* Secondary wall — right */}
      <spotLight
        position={[hw - 5, h - 2, cz + 4]}
        target-position={[hw - 0.5, 4.5, cz + 4]}
        color={LIGHT.warmWhite}
        intensity={40}
        angle={0.4}
        penumbra={0.6}
        distance={14}
        decay={2}
        castShadow={false}
      />
    </>
  );
}

// ─── Burgundy accent — low wall wash ─────────────────────────────────────────
function BurgundyAccents() {
  const { cz } = SPACES.atrium;
  return (
    <>
      {/* Left wall wash */}
      <pointLight
        position={[-14, 1.2, cz - 6]}
        color={LIGHT.burgundy}
        intensity={8}
        distance={10}
        decay={2}
      />
      {/* Right wall wash */}
      <pointLight
        position={[14, 1.2, cz + 2]}
        color={LIGHT.burgundy}
        intensity={8}
        distance={10}
        decay={2}
      />
      {/* Back wall accent */}
      <pointLight
        position={[0, 2.5, SPACES.atrium.cz - SPACES.atrium.d / 2 + 2]}
        color={LIGHT.burgundy}
        intensity={12}
        distance={12}
        decay={2}
      />
    </>
  );
}

// ─── Entrance hall lighting ───────────────────────────────────────────────────
function EntranceLighting() {
  const { cz, h } = SPACES.entrance;
  return (
    <>
      <pointLight
        position={[0, h - 0.5, cz]}
        color={LIGHT.warmWhite}
        intensity={14}
        distance={12}
        decay={2}
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
        shadow-camera-near={0.2}
        shadow-camera-far={12}
        shadow-bias={-0.002}
      />
      {/* Subtle gold floor wash at entrance */}
      <pointLight
        position={[0, 0.3, cz + 2]}
        color={LIGHT.gold}
        intensity={3}
        distance={6}
        decay={2}
      />
    </>
  );
}

// ─── Staircase lighting ───────────────────────────────────────────────────────
function StairLighting() {
  const { cx, startZ, endZ, startY, endY } = SPACES.stair;
  const midZ = (startZ + endZ) / 2;
  const midY = (startY + endY) / 2;
  return (
    <>
      {/* Overhead stair light */}
      <pointLight
        position={[cx, midY + 4, midZ]}
        color={LIGHT.warmWhite}
        intensity={16}
        distance={14}
        decay={2}
      />
      {/* Gold glow from under steps */}
      <pointLight
        position={[cx, midY - 1, midZ + 2]}
        color={LIGHT.stairGlow}
        intensity={5}
        distance={8}
        decay={2}
      />
      {/* Landing light */}
      <pointLight
        position={[cx, endY + 2, endZ - 1]}
        color={LIGHT.warmWhite}
        intensity={10}
        distance={8}
        decay={2}
      />
    </>
  );
}

// ─── Wing accent lights — visible through arches ──────────────────────────────
function WingLights() {
  return (
    <>
      <pointLight
        position={[SPACES.leftWing.cx, 4, 0]}
        color={LIGHT.gold}
        intensity={10}
        distance={12}
        decay={2}
      />
      <pointLight
        position={[SPACES.rightWing.cx, 4, 0]}
        color={LIGHT.gold}
        intensity={10}
        distance={12}
        decay={2}
      />
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function GalleryLighting() {
  return (
    <>
      {/* Very soft global fill — keeps shadows from going pure black */}
      <ambientLight color={LIGHT.ambient.color} intensity={LIGHT.ambient.intensity} />

      {/* Single key directional — establishes shadow direction */}
      <directionalLight
        color={LIGHT.key.color}
        intensity={LIGHT.key.intensity}
        position={[6, 18, 10]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0008}
      />

      <AtriumSkyLights />
      <ExhibitSpotlights />
      <BurgundyAccents />
      <EntranceLighting />
      <StairLighting />
      <WingLights />
    </>
  );
}
