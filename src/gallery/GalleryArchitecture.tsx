import EntranceHall   from './EntranceHall';
import CentralAtrium  from './CentralAtrium';
import GrandStaircase from './GrandStaircase';
import GalleryWings   from './GalleryWings';

export default function GalleryArchitecture() {
  return (
    <group>
      <EntranceHall />
      <CentralAtrium />
      <GrandStaircase />
      <GalleryWings />
    </group>
  );
}
