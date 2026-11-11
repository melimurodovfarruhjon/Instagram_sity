import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Building2, Instagram, MapPin, Maximize2, Trees, Users } from 'lucide-react';

const C = {
  grass: '#8fc58c', grass2: '#a8d39a', road: '#596b73', roadEdge: '#d9d8c8',
  sidewalk: '#e8e1ce', cream: '#f4e8ce', blue: '#8fc1d0', coral: '#e69b7d',
  yellow: '#e8c76f', mint: '#9fc7a5', dark: '#526d61'
};

function Ground() {
  return <group>
    <mesh rotation-x={-Math.PI/2} position={[0,-.16,0]} receiveShadow>
      <planeGeometry args={[64,64]}/><meshStandardMaterial color={C.grass}/>
    </mesh>
    <mesh position={[0,-.31,0]} receiveShadow>
      <boxGeometry args={[64,.3,64]}/><meshStandardMaterial color="#79ad78"/>
    </mesh>
    {Array.from({length:65},(_,i)=><mesh key={i} rotation-x={-Math.PI/2} position={[-29+(i%13)*4.8,-.145,-27+Math.floor(i/13)*9]}>
      <circleGeometry args={[.12,6]}/><meshBasicMaterial color="#d2e6a6"/>
    </mesh>)}
  </group>;
}

function Road({x=0,z=0,length=62,vertical=false,width=5.8}) {
  return <group position={[x,0,z]}>
    <mesh rotation-x={-Math.PI/2} position={[0,.005,0]} receiveShadow>
      <planeGeometry args={vertical?[width,length]:[length,width]}/><meshStandardMaterial color={C.road} roughness={1}/>
    </mesh>
    {[-width/2+.18,width/2-.18].map((v,i)=><mesh key={i} rotation-x={-Math.PI/2} position={vertical?[v,.018,0]:[0,.018,v]}>
      <planeGeometry args={vertical?[.18,length]:[length,.18]}/><meshStandardMaterial color="#e5e0cf"/>
    </mesh>)}
    {Array.from({length:Math.floor(length/5)},(_,i)=><mesh key={i} rotation-x={-Math.PI/2} position={vertical?[0,.025,-length/2+2.5+i*5]:[-length/2+2.5+i*5,.025,0]}>
      <planeGeometry args={vertical?[.12,2.1]:[2.1,.12]}/><meshBasicMaterial color="#f5d985"/>
    </mesh>)}
  </group>;
}

function Tree({x,z,size=1,tone=0}) {
  const greens=['#438b5c','#5b9d65','#78ae70'];
  return <group position={[x,0,z]} scale={size}>
    <mesh position={[0,.58,0]} castShadow><cylinderGeometry args={[.13,.2,1.16,6]}/><meshStandardMaterial color="#896449"/></mesh>
    <mesh position={[0,1.52,0]} castShadow><icosahedronGeometry args={[.88,1]}/><meshStandardMaterial color={greens[tone%3]} flatShading/></mesh>
    <mesh position={[.38,1.34,.12]} castShadow><icosahedronGeometry args={[.48,0]}/><meshStandardMaterial color="#8abf78" flatShading/></mesh>
  </group>;
}

function Lamp({x,z}) {
  return <group position={[x,0,z]}>
    <mesh position={[0,1.15,0]}><cylinderGeometry args={[.055,.075,2.3,6]}/><meshStandardMaterial color="#465b57"/></mesh>
    <mesh position={[0,2.32,0]}><sphereGeometry args={[.2,8,6]}/><meshStandardMaterial color="#fff1bf" emissive="#f8d98a" emissiveIntensity={.35}/></mesh>
  </group>;
}

function Bench({x,z,rotation=0}) {
  return <group position={[x,0,z]} rotation-y={rotation}>
    <mesh position={[0,.48,0]} castShadow><boxGeometry args={[1.5,.14,.48]}/><meshStandardMaterial color="#b77b4d"/></mesh>
    <mesh position={[0,.78,-.2]} castShadow><boxGeometry args={[1.5,.48,.12]}/><meshStandardMaterial color="#a96e47"/></mesh>
    {[-.55,.55].map(v=><mesh key={v} position={[v,.23,0]}><boxGeometry args={[.12,.48,.12]}/><meshStandardMaterial color="#4f6159"/></mesh>)}
  </group>;
}

function Building({x,z,w=5,d=5,h=8,color=C.cream,roof=C.coral,floors=4,style='flat'}) {
  const windows=Array.from({length:floors},(_,i)=>i);
  const cols=Math.max(2,Math.floor(w/1.15));
  return <group position={[x,0,z]}>
    <mesh position={[0,.16,0]} receiveShadow><boxGeometry args={[w+.8,.3,d+.8]}/><meshStandardMaterial color={C.sidewalk}/></mesh>
    <mesh position={[0,h/2+.3,0]} castShadow receiveShadow><boxGeometry args={[w,h,d]}/><meshStandardMaterial color={color} flatShading roughness={.88}/></mesh>
    <mesh position={[0,h+.34,0]} castShadow><boxGeometry args={[w+.22,.34,d+.22]}/><meshStandardMaterial color={roof} flatShading/></mesh>
    {windows.map(row=>Array.from({length:cols},(_,col)=><group key={row+'-'+col}>
      <mesh position={[-w/2+.65+col*(w-.9)/(cols-1),.95+row*(h-.8)/floors,d/2+.018]}>
        <boxGeometry args={[.43,.62,.045]}/><meshStandardMaterial color="#9dd4dc" emissive="#477c82" emissiveIntensity={.08}/>
      </mesh>
      <mesh position={[-w/2+.65+col*(w-.9)/(cols-1),.95+row*(h-.8)/floors,d/2+.045]}>
        <boxGeometry args={[.48,.055,.055]}/><meshStandardMaterial color="#f5e6c9"/>
      </mesh>
    </group>))}
    <mesh position={[0,.95,d/2+.045]}><boxGeometry args={[.72,1.3,.08]}/><meshStandardMaterial color="#805c48"/></mesh>
    {style==='balcony' && windows.slice(1).map(row=><mesh key={row} position={[0,.92+row*(h-.8)/floors,d/2+.16]}><boxGeometry args={[w-.5,.08,.35]}/><meshStandardMaterial color="#f4e8d1"/></mesh>)}
    <mesh position={[0,h+.55,0]}><boxGeometry args={[w*.45,.12,d*.45]}/><meshStandardMaterial color="#9da99b"/></mesh>
  </group>;
}

function Car({x,z,color='#e6a36f',rotation=0}) {
  return <group position={[x,.12,z]} rotation-y={rotation}>
    <mesh position={[0,.32,0]} castShadow><boxGeometry args={[1.8,.48,.9]}/><meshStandardMaterial color={color} flatShading/></mesh>
    <mesh position={[-.12,.66,0]} castShadow><boxGeometry args={[.95,.35,.76]}/><meshStandardMaterial color="#b9d9dc" roughness={.3}/></mesh>
    {[-.58,.58].flatMap(a=>[-.42,.42].map(b=><mesh key={a+'-'+b} rotation-z={Math.PI/2} position={[a,.15,b]}><cylinderGeometry args={[.2,.2,.12,10]}/><meshStandardMaterial color="#34434a"/></mesh>))}
  </group>;
}

function Park({x,z}) {
  return <group position={[x,0,z]}>
    <mesh rotation-x={-Math.PI/2} position={[0,.015,0]}><planeGeometry args={[13,12]}/><meshStandardMaterial color="#acd39a"/></mesh>
    <mesh rotation-x={-Math.PI/2} position={[0,.03,0]}><circleGeometry args={[2.1,12]}/><meshStandardMaterial color="#e9dfc8"/></mesh>
    <mesh position={[0,.32,0]} castShadow><cylinderGeometry args={[.85,1.05,.6,10]}/><meshStandardMaterial color="#8fc5c8"/></mesh>
    <mesh position={[0,.72,0]}><cylinderGeometry args={[.48,.48,.2,10]}/><meshStandardMaterial color="#d8f0e8"/></mesh>
    {[[-4,-3],[4,-3],[-4,3],[4,3]].map(([tx,tz],i)=><Tree key={i} x={tx} z={tz} size={.8} tone={i}/>)}
    <Bench x={-2.4} z={1.2} rotation={.5}/><Bench x={2.4} z={1.2} rotation={-.5}/>
  </group>;
}

function City() {
  const trees=useMemo(()=>[
    [-27,-23],[-23,-23],[-19,-23],[19,-23],[23,-23],[27,-23],
    [-27,23],[-23,23],[-19,23],[19,23],[23,23],[27,23],
    [-27,-7],[-27,7],[27,-7],[27,7],[-7,-27],[7,-27],[-7,27],[7,27]
  ],[]);
  return <group>
    <Ground/>
    <Road z={0}/><Road x={0} vertical/>
    <Road z={-19}/><Road z={19}/><Road x={-19} vertical/><Road x={19} vertical/>
    <Park x={-9.5} z={-9.5}/>
    <Building x={9.5} z={-9.5} w={6} d={5} h={12} color="#d7e4e2" roof="#668f91" floors={6} style="balcony"/>
    <Building x={-9.5} z={9.5} w={5.5} d={5} h={8} color="#f0d6ae" roof="#c78c63" floors={4}/>
    <Building x={9.5} z={9.5} w={6} d={5} h={10} color="#e9b9a5" roof="#bd7969" floors={5} style="balcony"/>
    <Building x={-28} z={-9.5} w={5} d={5} h={6} color="#d8e2b9" roof="#9aab77" floors={3}/>
    <Building x={28} z={-9.5} w={5} d={5} h={9} color="#b8d5e0" roof="#789cae" floors={4}/>
    <Building x={-28} z={9.5} w={5} d={5} h={7} color="#edc1b0" roof="#c57c69" floors={4}/>
    <Building x={28} z={9.5} w={5} d={5} h={6} color="#e9d9a9" roof="#c0a45f" floors={3}/>
    {trees.map(([x,z],i)=><Tree key={i} x={x} z={z} size={.75+(i%3)*.12} tone={i}/>)}
    {[-24,-14,14,24].map((v,i)=><Lamp key={'l'+i} x={v} z={-3.8}/>)}
    <Car x={-8} z={2.2} color="#e9a17d" rotation={Math.PI/2}/>
    <Car x={7} z={-2.1} color="#7ea9c5" rotation={Math.PI/2}/>
    <Car x={-24} z={-3} color="#e8c76f"/>
    <Car x={23} z={3} color="#8bb795"/>
  </group>;
}

function Scene() {
  return <>
    <color attach="background" args={['#cce8d9']}/>
    <fog attach="fog" args={['#cce8d9',85,150]}/>
    <ambientLight intensity={1.7}/>
    <hemisphereLight args={['#f2fbff','#64875f',.75]}/>
    <directionalLight position={[20,32,14]} intensity={2.4} castShadow shadow-mapSize={[2048,2048]}/>
    <OrthographicCamera makeDefault position={[42,48,42]} zoom={15} near={.1} far={220}/>
    <OrbitControls enableRotate={false} enablePan minDistance={25} maxDistance={95} minZoom={9} maxZoom={24}/>
    <Suspense fallback={null}><City/></Suspense>
  </>;
}

export default function App() {
  return <main className="app-shell">
    <Canvas shadows dpr={[1,1.5]} gl={{antialias:true,powerPreference:'high-performance'}}>
      <Scene/>
    </Canvas>
    <header className="topbar">
      <a className="brand" href="#" aria-label="Instagram City home"><span className="brand-mark"><Instagram size={19}/></span><span>instagram<span className="brand-light">_city</span></span></a>
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
  </main>;
}
