import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import { Trees, Building2, Users, MapPin, Instagram, Maximize2 } from 'lucide-react';
import * as THREE from 'three';

const palette = {
  grass: '#9bcf9b',
  grassLight: '#b7dca9',
  road: '#687783',
  roadLine: '#f4d77b',
  sidewalk: '#d8d9c9',
  white: '#f8f8f2',
  blue: '#83b8d7',
  coral: '#e99b83',
  yellow: '#e8c66f',
  green: '#83b78c',
};

function Ground() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.18, 0]} receiveShadow>
        <planeGeometry args={[66, 66]} />
        <meshStandardMaterial color={palette.grass} />
      </mesh>
      <mesh position={[0, -0.27, 0]} receiveShadow>
        <boxGeometry args={[66, 0.25, 66]} />
        <meshStandardMaterial color="#83b77f" />
      </mesh>
      {Array.from({ length: 18 }, (_, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[-29 + i * 3.4, -0.165, -28 + (i % 3) * 2]}>
          <circleGeometry args={[0.12 + (i % 2) * 0.08, 7]} />
          <meshBasicMaterial color="#d5e9a8" />
        </mesh>
      ))}
    </group>
  );
}

function Road({ position, size, horizontal = true }) {
  return (
    <group position={position}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.015, 0]} receiveShadow>
        <planeGeometry args={horizontal ? [size, 7] : [7, size]} />
        <meshStandardMaterial color={palette.road} roughness={1} />
      </mesh>
      {[-3.35, 3.35].map((offset) => (
        <mesh key={offset} rotation-x={-Math.PI / 2} position={horizontal ? [0, 0.025, offset] : [offset, 0.025, 0]}>
          <planeGeometry args={horizontal ? [size, 0.22] : [0.22, size]} />
          <meshStandardMaterial color="#cbd3d0" />
        </mesh>
      ))}
      {Array.from({ length: Math.floor(size / 4) }, (_, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={horizontal ? [-size / 2 + 2 + i * 4, 0.03, 0] : [0, 0.03, -size / 2 + 2 + i * 4]}>
          <planeGeometry args={horizontal ? [1.7, 0.13] : [0.13, 1.7]} />
          <meshBasicMaterial color={palette.roadLine} />
        </mesh>
      ))}
    </group>
  );
}

function Tree({ x, z, scale = 1 }) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.2, 1.1, 6]} />
        <meshStandardMaterial color="#8c6749" />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color="#4f9668" flatShading />
      </mesh>
      <mesh position={[0.42, 1.35, 0.12]} castShadow>
        <icosahedronGeometry args={[0.52, 0]} />
        <meshStandardMaterial color="#70ad70" flatShading />
      </mesh>
    </group>
  );
}

function Building({ x, z, w = 4, d = 4, h = 5, color = palette.white, roof = '#d97861', label }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.18, 0]} receiveShadow>
        <boxGeometry args={[w + 0.5, 0.35, d + 0.5]} />
        <meshStandardMaterial color={palette.sidewalk} />
      </mesh>
      <mesh position={[0, h / 2 + 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, h + 0.35, 0]} castShadow>
        <boxGeometry args={[w + 0.12, 0.28, d + 0.12]} />
        <meshStandardMaterial color={roof} flatShading />
      </mesh>
      {Array.from({ length: Math.max(1, Math.floor(h / 1.6)) }, (_, row) =>
        Array.from({ length: Math.max(1, Math.floor(w / 1.4)) }, (_, col) => (
          <mesh key={row + '-' + col} position={[-w / 2 + 0.75 + col * 1.35, 1.1 + row * 1.55, d / 2 + 0.012]}>
            <boxGeometry args={[0.48, 0.62, 0.035]} />
            <meshStandardMaterial color="#9ed2df" emissive="#426875" emissiveIntensity={0.08} />
          </mesh>
        ))
      )}
      <mesh position={[0, 0.95, d / 2 + 0.025]}>
        <boxGeometry args={[0.72, 1.35, 0.06]} />
        <meshStandardMaterial color="#8b6651" />
      </mesh>
    </group>
  );
}

function Plaza() {
  return (
    <group position={[0, 0.015, 0]}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <circleGeometry args={[5.3, 8]} />
        <meshStandardMaterial color="#e9dfc5" />
      </mesh>
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[1.15, 1.35, 0.62, 8]} />
        <meshStandardMaterial color="#9bbdc0" />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.68, 0.68, 0.25, 8]} />
        <meshStandardMaterial color="#d7eeee" />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.22, 8, 6]} />
        <meshStandardMaterial color="#b5e5e5" />
      </mesh>
      {[[-3.5, -2.8], [3.5, -2.8], [-3.5, 2.8], [3.5, 2.8]].map(([x, z], i) => <Tree key={i} x={x} z={z} scale={0.8} />)}
    </group>
  );
}

function City() {
  const trees = useMemo(() => [
    [-23,-20],[-19,-20],[-15,-20],[15,-20],[19,-20],[23,-20],
    [-23,20],[-19,20],[-15,20],[15,20],[19,20],[23,20],
    [-24,-9],[-24,-5],[-24,9],[-24,13],[24,-9],[24,-5],[24,9],[24,13],
    [-10,-24],[-6,-24],[6,-24],[10,-24],[-10,24],[-6,24],[6,24],[10,24]
  ], []);
  return (
    <group>
      <Ground />
      <Road position={[0, 0, 0]} size={58} horizontal />
      <Road position={[0, 0, 0]} size={58} horizontal={false} />
      <Road position={[0, 0, -16]} size={58} horizontal />
      <Road position={[0, 0, 16]} size={58} horizontal />
      <Road position={[-16, 0, 0]} size={58} horizontal={false} />
      <Road position={[16, 0, 0]} size={58} horizontal={false} />
      <Plaza />
      <Building x={-10} z={-10} w={5} d={5} h={10} color="#b5cbd7" roof="#738da3" />
      <Building x={10} z={-10} w={5} d={5} h={8} color="#e8b99b" roof="#c77d69" />
      <Building x={-10} z={10} w={5} d={5} h={7} color="#d9d5ad" roof="#b68d65" />
      <Building x={10} z={10} w={5} d={5} h={11} color="#a8c9b0" roof="#6d997c" />
      <Building x={-23} z={-10} w={4} d={5} h={5} color="#f0d1a5" roof="#d28a68" />
      <Building x={23} z={-10} w={4} d={5} h={6} color="#c2d5e5" roof="#758fa7" />
      <Building x={-23} z={10} w={4} d={5} h={4} color="#e9b6a8" roof="#bd786c" />
      <Building x={23} z={10} w={4} d={5} h={5} color="#d6d5b6" roof="#a59a6c" />
      {trees.map(([x,z], i) => <Tree key={i} x={x} z={z} scale={0.75 + (i % 3) * 0.12} />)}
    </group>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#d9eee5']} />
      <fog attach="fog" args={['#d9eee5', 48, 95]} />
      <ambientLight intensity={1.35} />
      <directionalLight position={[18, 28, 12]} intensity={2.1} castShadow shadow-mapSize={[2048, 2048]} />
      <hemisphereLight args={['#eaf7ff', '#75956f', 0.7]} />
      <OrthographicCamera makeDefault position={[42, 48, 42]} zoom={17} near={0.1} far={200} />
      <OrbitControls enableRotate={false} enablePan minDistance={25} maxDistance={90} minZoom={9} maxZoom={25} />
      <Suspense fallback={null}><City /></Suspense>
    </>
  );
}

export default function App() {
  return (
    <main className="app-shell">
      <Canvas shadows dpr={[1, 1.6]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <Scene />
      </Canvas>
      <header className="topbar">
        <a className="brand" href="#" aria-label="Instagram City home">
          <span className="brand-mark"><Instagram size={19} /></span>
          <span>instagram<span className="brand-light">_city</span></span>
        </a>
        <div className="city-stats">
          <div className="stat"><Users size={16}/><strong>20</strong><span>жителей</span></div>
          <div className="stat"><Building2 size={16}/><strong>8</strong><span>зданий</span></div>
          <div className="stat online"><i/>город активен</div>
        </div>
      </header>
      <aside className="welcome-card">
        <span className="eyebrow"><MapPin size={13}/> ВАШ ВИРТУАЛЬНЫЙ ГОРОД</span>
        <h1>Город начинается<br/>с одного жителя.</h1>
        <p>Первые улицы Instagram City уже построены. Скоро здесь появится ваш персонаж.</p>
        <div className="welcome-footer"><span><Trees size={15}/> Современный район</span><span>Сезон 01</span></div>
      </aside>
      <div className="map-hint"><Maximize2 size={14}/> Перетаскивайте карту · Колесо мыши — масштаб</div>
      <div className="bottom-pill"><span className="pulse"/> Первый район · Центральная площадь</div>
    </main>
  );
}