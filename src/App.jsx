import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Instagram, Trees, Users } from 'lucide-react';
import * as THREE from 'three';

function terrainHeight(x,z) {
  const hill=(cx,cz,rx,rz,h)=>h*Math.exp(-(((x-cx)/rx)**2+((z-cz)/rz)**2));
  return .2
    + hill(-34,-37,30,25,11.2)
    + hill(17,-49,24,30,9.8)
    + hill(49,-13,20,31,8.4)
    + hill(29,35,31,25,12.1)
    + hill(-21,45,27,30,9.3)
    + hill(-53,9,21,26,10.4)
    + hill(4,55,30,18,6.2)
    + hill(0,0,39,35,5.4)
    + hill(-9,13,19,17,1.25)
    + hill(16,-7,16,23,1.55)
    + hill(38,56,18,13,4.1)
    + hill(-72,-58,25,28,7.8)
    + hill(64,-76,23,24,9.2)
    + hill(78,33,22,31,7.4)
    + hill(35,77,32,20,6.5)
    + hill(-61,72,29,22,8.1)
    + hill(-82,8,21,23,5.6)
    + hill(76,-8,22,26,6.8)
    + Math.sin(x*.1+z*.065)*.3
    + Math.cos(z*.13-x*.04)*.24
    + Math.sin((x+z)*.035)*.7;
}

function Terrain() {
  const geometry=useMemo(()=>{
    const geo=new THREE.PlaneGeometry(180,180,220,220);
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
  ['#2f8748','#55ae54','#83c75a'],
  ['#318b61','#55b875','#91cf78'],
  ['#508e38','#79b94b','#a8d75e'],
  ['#267f67','#49ad7d','#87cc87']
];

function Tree({x,z,scale=1,variant=0}) {
  const y=terrainHeight(x,z);
  const colors=treePalette[variant%treePalette.length];
  const canopy=variant%2===0;
  return <group position={[x,y,z]} scale={scale}>
    <mesh position={[0,.82,0]} castShadow>
      <cylinderGeometry args={[.22,.34,1.65,7]}/>
      <meshStandardMaterial color="#805035" roughness={1}/>
    </mesh>
    {canopy ? <>
      <mesh position={[0,2.25,0]} castShadow><icosahedronGeometry args={[1.48,1]}/><meshStandardMaterial color={colors[1]} flatShading roughness={1}/></mesh>
      <mesh position={[-.88,2.2,.18]} castShadow><icosahedronGeometry args={[1.02,1]}/><meshStandardMaterial color={colors[0]} flatShading/></mesh>
      <mesh position={[.9,2.25,-.12]} castShadow><icosahedronGeometry args={[1.05,1]}/><meshStandardMaterial color={colors[2]} flatShading/></mesh>
      <mesh position={[-.1,3.05,.12]} castShadow><icosahedronGeometry args={[.9,1]}/><meshStandardMaterial color={colors[2]} flatShading/></mesh>
      <mesh position={[.12,1.75,.82]} castShadow><icosahedronGeometry args={[.75,1]}/><meshStandardMaterial color={colors[0]} flatShading/></mesh>
    </> : <>
      <mesh position={[0,1.95,0]} castShadow><coneGeometry args={[1.2,1.8,8]}/><meshStandardMaterial color={colors[1]} flatShading/></mesh>
      <mesh position={[0,2.8,0]} castShadow><coneGeometry args={[.92,1.7,8]}/><meshStandardMaterial color={colors[2]} flatShading/></mesh>
      <mesh position={[0,3.55,0]} castShadow><coneGeometry args={[.65,1.4,8]}/><meshStandardMaterial color={colors[0]} flatShading/></mesh>
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

function StoneCluster({x,z,scale=1,variant=0}) {
  const y=terrainHeight(x,z);
  const stonePalette=['#8f9ba0','#a9a79b','#87929f','#b3aa96'];
  const color=stonePalette[variant%stonePalette.length];
  return <group position={[x,y,z]} scale={scale}>
    <mesh position={[0,.42,0]} rotation={[.08,.18,-.06]} castShadow receiveShadow>
      <dodecahedronGeometry args={[.82,0]}/>
      <meshStandardMaterial color={color} flatShading roughness={1}/>
    </mesh>
    <mesh position={[-.62,.27,.18]} rotation={[.12,-.3,.04]} castShadow receiveShadow>
      <icosahedronGeometry args={[.48,0]}/>
      <meshStandardMaterial color={color} flatShading roughness={1}/>
    </mesh>
    <mesh position={[.62,.24,-.16]} rotation={[-.08,.4,-.12]} castShadow receiveShadow>
      <dodecahedronGeometry args={[.43,0]}/>
      <meshStandardMaterial color={color} flatShading roughness={1}/>
    </mesh>
    <mesh position={[0,.12,0]} scale={[1.22,.22,.9]} receiveShadow>
      <sphereGeometry args={[.85,7,5]}/>
      <meshStandardMaterial color="#66774e" flatShading roughness={1}/>
    </mesh>
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

function seededValue(seed) {
  const value=Math.sin(seed*127.1+311.7)*43758.5453;
  return value-Math.floor(value);
}

function GrassField() {
  const meshRef=useRef();
  const bladeCount=6;
  const clumps=useMemo(()=>{
    const result=[];
    for(let seed=1;result.length<520;seed++){
      const x=seededValue(seed*2)*170-85;
      const z=seededValue(seed*2+1)*170-85;
      if(Math.abs(x)<14&&Math.abs(z)<17)continue;
      result.push({x,z,seed,y:terrainHeight(x,z)});
    }
    return result;
  },[]);
  useLayoutEffect(()=>{
    const mesh=meshRef.current;
    if(!mesh)return;
    const matrix=new THREE.Matrix4();
    const position=new THREE.Vector3();
    const rotation=new THREE.Euler();
    const quaternion=new THREE.Quaternion();
    const scale=new THREE.Vector3();
    const color=new THREE.Color();
    const palette=['#75a94d','#8cbd57','#a6c75b','#5c9847','#b1c968','#6fa653'];
    let index=0;
    clumps.forEach(({x,y,z,seed})=>{
      const baseAngle=seededValue(seed*3)*Math.PI*2;
      for(let blade=0;blade<bladeCount;blade++){
        const angle=baseAngle+blade*Math.PI*2/bladeCount;
        const radius=blade===0?0:.13+seededValue(seed*11+blade)*.12;
        const height=.55+seededValue(seed*17+blade)*.72;
        position.set(x+Math.cos(angle)*radius,y+height*.48,z+Math.sin(angle)*radius);
        rotation.set((seededValue(seed*19+blade)-.5)*.24,angle,(seededValue(seed*23+blade)-.5)*.24);
        quaternion.setFromEuler(rotation);
        scale.set(.72,height,.72);
        matrix.compose(position,quaternion,scale);
        mesh.setMatrixAt(index,matrix);
        color.set(palette[(seed+blade)%palette.length]);
        mesh.setColorAt(index,color);
        index++;
      }
    });
    mesh.instanceMatrix.needsUpdate=true;
    if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
    mesh.computeBoundingSphere();
  },[clumps]);
  return <instancedMesh ref={meshRef} args={[undefined,undefined,clumps.length*bladeCount]} castShadow>
    <coneGeometry args={[.12,1,5]}/>
    <meshStandardMaterial color="#ffffff" roughness={1} flatShading/>
  </instancedMesh>;
}

function CabinWindow({position}) {
  return <group position={position}>
    <mesh position={[0,0,-.04]} castShadow><boxGeometry args={[2.65,2.85,.28]}/><meshStandardMaterial color="#68402d" roughness={1}/></mesh>
    <mesh position={[0,0,.13]}><boxGeometry args={[2.12,2.28,.12]}/><meshStandardMaterial color="#ffd982" emissive="#f4a83b" emissiveIntensity={.8} roughness={.35}/></mesh>
    {[-.52,.52].map(x=><mesh key={'v'+x} position={[x,0,.22]}><boxGeometry args={[.12,2.28,.12]}/><meshStandardMaterial color="#8a5534" roughness={1}/></mesh>)}
    <mesh position={[0,0,.23]}><boxGeometry args={[2.12,.13,.12]}/><meshStandardMaterial color="#8a5534" roughness={1}/></mesh>
    {[-1,1].map(side=><mesh key={'s'+side} position={[side*1.48,0,.12]}><boxGeometry args={[.36,2.65,.25]}/><meshStandardMaterial color={side<0?'#b27643':'#d49450'} roughness={1}/></mesh>)}
    <mesh position={[0,-1.48,.2]}><boxGeometry args={[2.95,.28,.55]}/><meshStandardMaterial color="#805039" roughness={1}/></mesh>
    <mesh position={[0,1.48,.18]}><boxGeometry args={[2.95,.24,.42]}/><meshStandardMaterial color="#805039" roughness={1}/></mesh>
  </group>;
}

function ChimneySmoke() {
  const smokeRef=useRef();
  useFrame(({clock})=>{
    const puffs=smokeRef.current?.children;
    if(!puffs)return;
    const time=clock.getElapsedTime();
    puffs.forEach((puff,index)=>{
      const phase=(time*.22+index*.28)%1;
      puff.position.set(Math.sin(time*.8+index)*.16,.25+phase*2.4,0);
      puff.scale.setScalar(.16+phase*.32);
      puff.material.opacity=(1-phase)*.34;
    });
  });
  return <group ref={smokeRef} position={[3.65,11.2,-1.45]}>
    {[0,1,2,3].map(index=><mesh key={index}><sphereGeometry args={[1,8,6]}/><meshBasicMaterial color="#f3f2e8" transparent opacity={.25} depthWrite={false}/></mesh>)}
  </group>;
}

function MainCabin() {
  const baseY=terrainHeight(0,0);
  const gableGeometry=useMemo(()=>{
    const shape=new THREE.Shape();
    shape.moveTo(-6.5,0);shape.lineTo(0,3.5);shape.lineTo(6.5,0);shape.closePath();
    return new THREE.ShapeGeometry(shape);
  },[]);
  const pathTiles=Array.from({length:7},(_,i)=>{
    const z=8+i*1.45;
    return [0,terrainHeight(0,z)-baseY,z];
  });
  return <group position={[0,baseY,0]}>
    <mesh position={[0,.35,0]} receiveShadow castShadow><boxGeometry args={[14.4,.7,12.4]}/><meshStandardMaterial color="#75634c" flatShading roughness={1}/></mesh>
    <mesh position={[0,3.55,0]} castShadow receiveShadow><boxGeometry args={[13,6.4,11]}/><meshStandardMaterial color="#bd7a3e" roughness={1}/></mesh>
    <mesh geometry={gableGeometry} position={[0,6.75,5.52]} castShadow><meshStandardMaterial color="#cc8b4a" side={THREE.DoubleSide} roughness={1}/></mesh>
    <mesh geometry={gableGeometry} position={[0,6.75,-5.52]} rotation-y={Math.PI} castShadow><meshStandardMaterial color="#a96539" side={THREE.DoubleSide} roughness={1}/></mesh>
    {[-6.35,6.35].map(x=><mesh key={'post'+x} position={[x,3.6,5.62]} castShadow><boxGeometry args={[.34,6.5,.38]}/><meshStandardMaterial color="#714329" roughness={1}/></mesh>)}
    {[.62,5.95].map(y=><mesh key={'beam'+y} position={[0,y,5.62]} castShadow><boxGeometry args={[13,.28,.38]}/><meshStandardMaterial color="#85512f" roughness={1}/></mesh>)}
    <CabinWindow position={[-3.55,3.55,5.66]}/>
    <CabinWindow position={[3.55,3.55,5.66]}/>
    <mesh position={[0,1.95,5.72]} castShadow><boxGeometry args={[2.3,3.65,.32]}/><meshStandardMaterial color="#784327" roughness={1}/></mesh>
    {[-1.25,1.25].map(x=><mesh key={'doorframe'+x} position={[x,1.95,5.93]}><boxGeometry args={[.22,3.9,.3]}/><meshStandardMaterial color="#e3ad61" roughness={1}/></mesh>)}
    <mesh position={[0,3.93,5.93]}><boxGeometry args={[2.7,.24,.3]}/><meshStandardMaterial color="#e3ad61" roughness={1}/></mesh>
    <mesh position={[0,1.9,5.91]}><boxGeometry args={[1.74,2.95,.12]}/><meshStandardMaterial color="#986039" roughness={1}/></mesh>
    <mesh position={[.68,1.95,6.02]}><sphereGeometry args={[.13,8,6]}/><meshStandardMaterial color="#f2c86f" metalness={.35} roughness={.4}/></mesh>
    {[-6.35,6.35].map(x=><mesh key={'sidebeam'+x} position={[x,3.6,0]} castShadow><boxGeometry args={[.3,6.3,11.2]}/><meshStandardMaterial color="#82502f" roughness={1}/></mesh>)}
    <mesh position={[-3.45,8.55,0]} rotation-z={.49} castShadow><boxGeometry args={[8.1,.58,12]}/><meshStandardMaterial color="#743d32" roughness={1}/></mesh>
    <mesh position={[3.45,8.55,0]} rotation-z={-.49} castShadow><boxGeometry args={[8.1,.58,12]}/><meshStandardMaterial color="#864638" roughness={1}/></mesh>
    <mesh position={[0,10.2,0]} castShadow><boxGeometry args={[.45,.36,12.25]}/><meshStandardMaterial color="#56352c" roughness={1}/></mesh>
    {[-1,1].map(side=><mesh key={'eave'+side} position={[0,6.72,side*5.7]} castShadow><boxGeometry args={[14,.42,.42]}/><meshStandardMaterial color="#5b382d" roughness={1}/></mesh>)}
    <mesh position={[3.65,9.1,-1.45]} castShadow><boxGeometry args={[1.35,3.1,1.45]}/><meshStandardMaterial color="#a8583d" flatShading roughness={1}/></mesh>
    <mesh position={[3.65,10.72,-1.45]} castShadow><boxGeometry args={[1.7,.35,1.8]}/><meshStandardMaterial color="#713d33" flatShading roughness={1}/></mesh>
    <ChimneySmoke/>
    {pathTiles.map(([x,y,z],index)=><mesh key={'path'+index} position={[x,y+.12,z]} rotation-y={(index%2?-.18:.12)} receiveShadow><boxGeometry args={[1.35,.22,1.05]}/><meshStandardMaterial color={index%2?'#b6a892':'#c9b99e'} flatShading roughness={1}/></mesh>)}
  </group>;
}

function Nature() {
  const trees=useMemo(()=>[
    [-38,-30,.95,0],[-30,-35,1.2,1],[-20,-31,.85,2],[-8,-38,1.1,0],[8,-34,.9,3],[24,-37,1.15,1],[38,-27,1,2],
    [-42,-12,1.2,3],[-31,-8,.9,0],[-38,17,1.1,2],[-29,31,1.15,0],[-14,36,.9,3],
    [2,29,1.2,1],[17,35,1.05,2],[32,27,1.2,0],[42,12,.95,3],[35,-4,1.2,1],[25,8,.85,2],
    [8,-42,.85,0],[-7,-43,1.1,2],[15,-42,1.2,3],[-43,36,.95,1],[43,38,1.1,0],
    [-5,43,.82,3],[4,44,.9,1],[20,42,.95,2],
    [-55,-48,1.15,1],[-42,-57,.9,3],[-18,-59,1.2,0],[12,-61,.95,2],[43,-52,1.1,3],
    [59,-29,.95,0],[61,4,1.2,2],[54,39,1.05,1],[32,58,.9,3],[5,62,1.15,0],
    [-27,57,1.05,2],[-57,38,.9,1],[-62,5,1.1,3],[-57,-20,.85,0],
    [-78,-68,1.1,2],[-48,-78,.95,0],[-12,-82,1.25,3],[28,-79,1,1],[68,-69,1.15,0],
    [82,-35,.9,3],[79,7,1.1,2],[71,52,1.05,1],[45,78,.9,0],[7,82,1.15,3],
    [-34,79,1.05,2],[-73,61,.95,1],[-84,18,1.2,0],[-79,-22,.85,3]
  ],[]);
  const stones=useMemo(()=>[
    [-39,-26,.9,0],[-24,-39,1.15,2],[-8,-42,.75,1],[13,-43,1.05,3],[34,-35,1.2,0],
    [42,-17,.85,1],[39,7,1.1,2],[41,31,1.2,3],[24,41,.9,0],[2,40,1.1,2],
    [-21,42,1.25,1],[-40,34,.9,3],[-43,8,1.1,0],[-34,-4,.7,2],
    [-61,-44,1.15,2],[-37,-62,.9,0],[2,-57,1.2,3],[55,-48,.85,1],
    [63,-4,1.05,0],[48,55,1.1,2],[12,64,.8,3],[-32,60,1.25,1],[-62,27,.95,2],
    [-82,-63,1.1,3],[-55,-82,.9,1],[-6,-78,1.25,0],[48,-81,1.05,2],[79,-57,.85,1],
    [84,-5,1.2,3],[75,37,.95,0],[38,83,1.1,1],[-18,82,.9,2],[-59,73,1.15,3],[-84,42,.85,1]
  ],[]);
  const bushes=useMemo(()=>[
    [-34,-20],[-25,-18],[-12,-28],[1,-30],[17,-29],[30,-18],[39,-12],
    [-39,4],[-28,13],[-17,22],[-4,28],[12,26],[27,20],[39,22],
    [-35,30],[29,2],[-14,-8]
  ],[]);
  const flowers=useMemo(()=>[[-32,-25],[-17,-34],[12,-37],[34,-28],[-40,22],[-22,28],[-4,34],[20,30],[39,9],[1,-16]],[]);
  return <group>
    <Terrain/>
    {trees.map(([x,z,s,v],i)=><Tree key={'tree'+i} x={x} z={z} scale={s} variant={v}/>)}
    {stones.map(([x,z,s,v],i)=><StoneCluster key={'stone'+i} x={x} z={z} scale={s} variant={v}/>)}
    {bushes.map(([x,z],i)=><Bush key={'bush'+i} x={x} z={z} scale={.7+(i%3)*.18}/>)}
    {flowers.map(([x,z],i)=><FlowerPatch key={'flower'+i} x={x} z={z}/>)}
    <GrassField/>
  </group>;
}

function Scene() {
  return <>
    <color attach="background" args={['#b9dfec']}/>
    <ambientLight intensity={1.15}/>
    <hemisphereLight args={['#e8f8ff','#668c55',.8]}/>
    <directionalLight position={[-25,38,18]} intensity={2.3} castShadow shadow-mapSize={[2048,2048]}/>
    <OrthographicCamera makeDefault position={[62,72,62]} zoom={8.2} near={.1} far={420}/>
    <OrbitControls
      enableRotate
      enablePan
      enableZoom
      enableDamping
      dampingFactor={0.08}
      screenSpacePanning
      zoomToCursor
      panSpeed={1.7}
      rotateSpeed={0.75}
      zoomSpeed={1.15}
      mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }}
      touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE }}
      maxPolarAngle={Math.PI/2.15}
      minPolarAngle={Math.PI/5}
      minDistance={30}
      maxDistance={210}
      minZoom={4.2}
      maxZoom={22}
    />
    <Nature/>
    <MainCabin/>
  </>;
}

export default function App() {
  return <main className="app-shell">
    <Canvas shadows dpr={[1,1.5]} gl={{antialias:true,powerPreference:'high-performance'}}>
      <Scene/>
    </Canvas>
  </main>;
}
