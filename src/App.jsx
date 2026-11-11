import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Instagram, Trees, Users } from 'lucide-react';
import * as THREE from 'three';

function terrainHeight(x,z) {
  const hill=(cx,cz,rx,rz,h)=>h*Math.exp(-(((x-cx)/rx)**2+((z-cz)/rz)**2));
  return .15
    + hill(-24,-18,17,14,5.8)
    + hill(19,-25,19,16,7.2)
    + hill(25,17,18,15,5.2)
    + hill(-18,25,20,17,4.5)
    + hill(0,0,28,24,1.15)
    + Math.sin(x*.12+z*.07)*.32
    + Math.cos(z*.16-x*.045)*.24;
}

function Terrain() {
  const geometry=useMemo(()=>{
    const geo=new THREE.PlaneGeometry(100,100,150,150);
    const p=geo.attributes.position;
    const colors=[];
    const low=new THREE.Color('#83bd70');
    const mid=new THREE.Color('#9bce7d');
    const high=new THREE.Color('#b5d88b');
    for(let i=0;i<p.count;i++){
      const x=p.getX(i), z=-p.getY(i);
      const y=terrainHeight(x,z);
      p.setZ(i,y);
      const t=THREE.MathUtils.clamp((y-.2)/7,0,1);
      const c=low.clone().lerp(mid,Math.min(t*2,1)).lerp(high,Math.max(0,t-.55)*.55);
      const variation=(Math.sin(x*1.7+z*.8)*.012);
      c.offsetHSL(0,0,variation);
      colors.push(c.r,c.g,c.b);
    }
    geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    geo.computeVertexNormals();
    return geo;
  },[]);
  return <mesh geometry={geometry} rotation-x={-Math.PI/2} receiveShadow>
    <meshStandardMaterial vertexColors roughness={1}/>
  </mesh>;
}

const treePalette=[
  ['#367c4c','#4b9858','#6eae68'],
  ['#397f58','#579e68','#83bd79'],
  ['#477f43','#6ba34e','#94bd64'],
  ['#34775b','#4b9369','#77b47c']
];

function Tree({x,z,scale=1,variant=0}) {
  const y=terrainHeight(x,z);
  const colors=treePalette[variant%treePalette.length];
  const canopy=variant%2===0;
  return <group position={[x,y,z]} scale={scale}>
    <mesh position={[0,.9,0]} castShadow>
      <cylinderGeometry args={[.17,.28,1.8,7]}/>
      <meshStandardMaterial color="#79533a" roughness={1}/>
    </mesh>
    {[[-.35,1.5,0,.11],[.35,1.65,.05,.1],[-.12,2,.18,.09],[.2,2.15,-.1,.08]].map(([bx,by,bz,r],i)=>
      <mesh key={i} position={[bx,by,bz]} rotation-z={(i%2?-.55:.55)}>
        <cylinderGeometry args={[r,.13,.85,6]}/><meshStandardMaterial color="#805a3e"/>
      </mesh>
    )}
    {canopy ? <>
      <mesh position={[0,2.75,0]} castShadow><icosahedronGeometry args={[1.35,2]}/><meshStandardMaterial color={colors[1]} flatShading roughness={1}/></mesh>
      <mesh position={[-.72,2.45,.12]} castShadow><icosahedronGeometry args={[.85,1]}/><meshStandardMaterial color={colors[0]} flatShading/></mesh>
      <mesh position={[.72,2.48,-.08]} castShadow><icosahedronGeometry args={[.9,1]}/><meshStandardMaterial color={colors[2]} flatShading/></mesh>
      <mesh position={[.05,3.45,.15]} castShadow><icosahedronGeometry args={[.72,1]}/><meshStandardMaterial color={colors[2]} flatShading/></mesh>
    </> : <>
      <mesh position={[0,2.55,0]} castShadow><coneGeometry args={[1.12,1.8,8]}/><meshStandardMaterial color={colors[1]} flatShading/></mesh>
      <mesh position={[0,3.35,0]} castShadow><coneGeometry args={[.82,1.55,8]}/><meshStandardMaterial color={colors[2]} flatShading/></mesh>
      <mesh position={[0,4.05,0]} castShadow><coneGeometry args={[.52,1.15,8]}/><meshStandardMaterial color={colors[0]} flatShading/></mesh>
    </>}
  </group>;
}

function Bush({x,z,scale=1,color='#5b9d5e'}) {
  const y=terrainHeight(x,z);
  return <group position={[x,y,z]} scale={scale}>
    {[[0,.35,0],[-.35,.25,.08],[.3,.28,-.1],[.08,.48,.18]].map(([a,b,c],i)=>
      <mesh key={i} position={[a,b,c]} castShadow><dodecahedronGeometry args={[.42,1]}/><meshStandardMaterial color={i%2?color:'#75b96d'} flatShading/></mesh>
    )}
  </group>;
}

function FlowerPatch({x,z}) {
  const y=terrainHeight(x,z);
  const flowers=['#f5e7a0','#fff4e7','#e8a6a2','#c4a6df'];
  return <group position={[x,y,z]}>
    {Array.from({length:9},(_,i)=>{
      const a=i*2.4, r=.25+(i%3)*.16;
      return <group key={i} position={[Math.cos(a)*r,0,Math.sin(a)*r]}>
        <mesh position={[0,.18,0]}><cylinderGeometry args={[.018,.025,.36,5]}/><meshStandardMaterial color="#4e9857"/></mesh>
        <mesh position={[0,.39,0]}><sphereGeometry args={[.11,7,6]}/><meshStandardMaterial color={flowers[i%4]}/></mesh>
      </group>;
    })}
  </group>;
}

function GrassTuft({x,z,scale=1}) {
  const y=terrainHeight(x,z);
  return <group position={[x,y,z]} scale={scale}>
    {[-.18,0,.18].map((v,i)=><mesh key={i} position={[v,.22,0]} rotation-z={(i-1)*-.45}>
      <coneGeometry args={[.09,.5,4]}/><meshStandardMaterial color={i===1?'#6da95d':'#85bd69'} flatShading/>
    </mesh>)}
  </group>;
}

function Nature() {
  const trees=useMemo(()=>[
    [-38,-30,.95,0],[-30,-35,1.2,1],[-20,-31,.85,2],[-8,-38,1.1,0],[8,-34,.9,3],[24,-37,1.15,1],[38,-27,1,2],
    [-42,-12,1.2,3],[-31,-8,.9,0],[-22,5,1.25,1],[-38,17,1.1,2],[-29,31,1.15,0],[-14,36,.9,3],
    [2,29,1.2,1],[17,35,1.05,2],[32,27,1.2,0],[42,12,.95,3],[35,-4,1.2,1],[25,8,.85,2],
    [8,-12,.85,0],[-7,-18,1.1,2],[15,-20,1.2,3],[-43,36,.95,1],[43,38,1.1,0],
    [-5,8,.82,3],[4,15,.9,1],[20,18,.95,2]
  ],[]);
  const bushes=useMemo(()=>[
    [-34,-20],[-25,-18],[-12,-28],[1,-30],[17,-29],[30,-18],[39,-12],
    [-39,4],[-28,13],[-17,22],[-4,28],[12,26],[27,20],[39,22],
    [-35,30],[5,-4],[29,2],[-14,-8]
  ],[]);
  const flowers=useMemo(()=>[[-32,-25],[-17,-34],[12,-37],[34,-28],[-40,22],[-22,28],[-4,34],[20,30],[39,9],[1,-16]],[]);
  const tufts=useMemo(()=>Array.from({length:100},(_,i)=>{
    const x=((i*37)%91)-45, z=((i*53)%91)-45;
    return [x,z,.55+(i%5)*.16];
  }),[]);
  return <group>
    <Terrain/>
    {trees.map(([x,z,s,v],i)=><Tree key={'tree'+i} x={x} z={z} scale={s} variant={v}/>)}
    {bushes.map(([x,z],i)=><Bush key={'bush'+i} x={x} z={z} scale={.7+(i%3)*.18}/>)}
    {flowers.map(([x,z],i)=><FlowerPatch key={'flower'+i} x={x} z={z}/>)}
    {tufts.map(([x,z,s],i)=><GrassTuft key={'grass'+i} x={x} z={z} scale={s}/>)}
  </group>;
}

function Scene() {
  return <>
    <color attach="background" args={['#b9dfec']}/>
    <ambientLight intensity={1.15}/>
    <hemisphereLight args={['#e8f8ff','#668c55',.8]}/>
    <directionalLight position={[-25,38,18]} intensity={2.3} castShadow shadow-mapSize={[2048,2048]}/>
    <OrthographicCamera makeDefault position={[48,57,48]} zoom={11.8} near={.1} far={250}/>
    <OrbitControls enableRotate maxPolarAngle={Math.PI/2.15} minPolarAngle={Math.PI/5} enablePan minDistance={35} maxDistance={120} minZoom={7} maxZoom={20}/>
    <Nature/>
  </>;
}

export default function App() {
  return <main className="app-shell">
    <Canvas shadows dpr={[1,1.5]} gl={{antialias:true,powerPreference:'high-performance'}}>
      <Scene/>
    </Canvas>
    <header className="topbar">
      <a className="brand" href="#" aria-label="Instagram City home"><span className="brand-mark"><Instagram size={19}/></span><span>instagram<span className="brand-light">_city</span></span></a>
      <div className="city-stats"><div className="stat"><Users size={16}/><strong>20</strong><span>жителей</span></div></div>
    </header>
    <div className="bottom-pill"><span className="pulse"/> Зелёная долина · Природная зона</div>
  </main>;
}
