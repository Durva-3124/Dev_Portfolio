import type { FC } from 'react';

const Lights: FC = () => {
  return (
    <>
      <ambientLight intensity={0.5} color="#ffffff" />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" castShadow />
      <pointLight position={[-5, 3, -5]} intensity={0.6} color="#e0b878" />
      <pointLight position={[5, -2, 5]} intensity={0.3} color="#c2274f" />
    </>
  );
};

export default Lights;
