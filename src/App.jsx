import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Instagram, Trees, Users } from 'lucide-react';
import * as THREE from 'three';

function terrainHeight(x,z) {
  const hill=(cx,cz,rx,rz,h)=>h*Math.exp(-(((x-cx)/rx)**2+((z-cz)/rz)**2));
  return .2
    + hill(-34,-37,30,25,5.2)
    + hill(17,-49,24,30,4.4)
    + hill(49,-13,20,31,3.8)
    + hill(29,35,31,25,5.4)
    + hill(-21,45,27,30,4)
    + hill(-53,9,21,26,4.6)
    + hill(4,55,30,18,2.7)
    + hill(0,0,39,35,2.3)
    + hill(-9,13,19,17,.55)
    + hill(16,-7,16,23,.7)
    + hill(38,56,18,13,2)
    + hill(-72,-58,25,28,3.6)
    + hill(64,-76,23,24,4.2)
    + hill(78,33,22,31,3.3)
    + hill(35,77,32,20,2.8)
    + hill(-61,72,29,22,3.7)
    + hill(-82,8,21,23,2.5)
    + hill(76,-8,22,26,3.1)
    + Math.sin(x*.1+z*.065)*.16
    + Math.cos(z*.13-x*.04)*.12
    + Math.sin((x+z)*.035)*.35;
}

function Terrain() {
  const geometry=useMemo(()=>{
    const geo=new THREE.PlaneGeometry(180,180,220,220);
    const p=geo.attributes.position;
    const colors=[];
    const low=new THREE.Color('#679b4a');
    const mid=new THREE.Color('#7eaf51');
    const high=new THREE.Color('#a1c65e');
    for(let i=0;i<p.count;i++){
      const x=p.getX(i), z=-p.getY(i);
      const y=terrainHeight(x,z);
      p.setZ(i,y);
      const t=THREE.MathUtils.clamp((y-.2)/7,0,1);
      const c=low.clone().lerp(mid,Math.min(t*2,1)).lerp(high,Math.max(0,t-.55)*.55);
      const variation=Math.sin(x*.55+Math.cos(z*.21))*.018+Math.sin(z*.43-x*.37)*.012+Math.cos((x+z)*.18)*.008;
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

function OfficeGlassPanel({position,rotationY=0,width=2.8,height=3.35}) {
  return <group position={position} rotation-y={rotationY}>
    <mesh position={[0,0,-.02]}>
      <boxGeometry args={[width-.16,height-.16,.09]}/>
      <meshPhysicalMaterial color="#c8f4ff" transmission={.9} thickness={.12} ior={1.46} roughness={.055} metalness={0} transparent opacity={.32} envMapIntensity={1}/>
    </mesh>
    {[-width/2,width/2].map(x=><mesh key={'edge'+x} position={[x,0,.08]}>
      <boxGeometry args={[.12,height,.18]}/><meshStandardMaterial color="#dce8e7" metalness={.72} roughness={.2}/>
    </mesh>)}
    {[-height/2,height/2].map(y=><mesh key={'rail'+y} position={[0,y,.08]}>
      <boxGeometry args={[width,.12,.18]}/><meshStandardMaterial color="#dce8e7" metalness={.72} roughness={.2}/>
    </mesh>)}
    <mesh position={[0,0,.09]}>
      <boxGeometry args={[.08,height-.12,.18]}/><meshStandardMaterial color="#a8ced3" metalness={.6} roughness={.22}/>
    </mesh>
  </group>;
}

function OfficeBalconyRail({x}) {
  return <group position={[x,5.25,10.45]}>
    <mesh><boxGeometry args={[2.85,1.05,.14]}/><meshPhysicalMaterial color="#c8f4ff" transmission={.82} thickness={.08} roughness={.08} transparent opacity={.38}/></mesh>
    <mesh position={[0,.55,0]}><boxGeometry args={[2.9,.12,.2]}/><meshStandardMaterial color="#dce9e8" metalness={.75} roughness={.2}/></mesh>
    {[-1.38,1.38].map(side=><mesh key={side} position={[side,0,0]}><boxGeometry args={[.1,1.15,.22]}/><meshStandardMaterial color="#dce9e8" metalness={.75} roughness={.2}/></mesh>)}
  </group>;
}

function OfficeSofa({position,rotationY=0}) {
  return <group position={position} rotation-y={rotationY}>
    {[[-1.15,.16,-.38],[1.15,.16,-.38],[-1.15,.16,.38],[1.15,.16,.38]].map(([x,y,z],i)=><mesh key={'leg'+i} position={[x,y,z]}><cylinderGeometry args={[.045,.06,.32,8]}/><meshStandardMaterial color="#485c62" metalness={.5} roughness={.3}/></mesh>)}
    <mesh position={[0,.48,0]}><boxGeometry args={[2.8,.5,1.15]}/><meshStandardMaterial color="#4b7e83" roughness={.82}/></mesh>
    <mesh position={[0,.98,-.43]}><boxGeometry args={[2.8,.95,.3]}/><meshStandardMaterial color="#39656d" roughness={.82}/></mesh>
    {[-1.42,1.42].map(side=><mesh key={side} position={[side,.72,0]}><boxGeometry args={[.28,.8,1.15]}/><meshStandardMaterial color="#47767d" roughness={.82}/></mesh>)}
    {[-.78,0,.78].map(x=><mesh key={x} position={[x,.76,.08]}><boxGeometry args={[.72,.16,.78]}/><meshStandardMaterial color={x===0?'#91b8b6':'#79a6a7'} roughness={.9}/></mesh>)}
  </group>;
}

function OfficeChair({position,rotationY=0}) {
  return <group position={position} rotation-y={rotationY}>
    <mesh position={[0,.58,0]}><boxGeometry args={[.95,.2,.92]}/><meshStandardMaterial color="#526b71" roughness={.7}/></mesh>
    <mesh position={[0,1.12,-.34]}><boxGeometry args={[.88,1.05,.18]}/><meshStandardMaterial color="#405b62" roughness={.72}/></mesh>
    <mesh position={[0,.25,0]}><cylinderGeometry args={[.07,.09,.5,8]}/><meshStandardMaterial color="#c7d1d0" metalness={.7} roughness={.24}/></mesh>
    {[0,1,2,3,4].map(i=><mesh key={i} position={[Math.cos(i*Math.PI*2/5)*.38,.06,Math.sin(i*Math.PI*2/5)*.38]} rotation-z={Math.PI/2}><cylinderGeometry args={[.025,.025,.42,6]}/><meshStandardMaterial color="#89999a" metalness={.6} roughness={.3}/></mesh>)}
  </group>;
}

function OfficeWorkstation({position}) {
  return <group position={position}>
    <mesh position={[0,1.05,0]}><boxGeometry args={[2.65,.16,1.25]}/><meshStandardMaterial color="#d8e1df" roughness={.38}/></mesh>
    {[-1.16,1.16].map(x=><mesh key={x} position={[x,.55,0]}><boxGeometry args={[.1,1,.1]}/><meshStandardMaterial color="#83999b" metalness={.45} roughness={.3}/></mesh>)}
    <mesh position={[0,1.68,-.38]}><boxGeometry args={[1.18,.78,.1]}/><meshStandardMaterial color="#1e3943" metalness={.35} roughness={.2}/></mesh>
    <mesh position={[0,1.68,-.315]}><boxGeometry args={[1.03,.61,.025]}/><meshStandardMaterial color="#6ac8d6" emissive="#2a7180" emissiveIntensity={.4} roughness={.2}/></mesh>
    <mesh position={[0,1.45,-.38]}><boxGeometry args={[.12,.32,.12]}/><meshStandardMaterial color="#879b9b" metalness={.5} roughness={.3}/></mesh>
    <mesh position={[0,1.16,.35]}><boxGeometry args={[.72,.035,.24]}/><meshStandardMaterial color="#9caead" roughness={.55}/></mesh>
    <OfficeChair position={[0,0,1.02]}/>
  </group>;
}

function OfficePlant({position,scale=1}) {
  return <group position={position} scale={scale}>
    <mesh position={[0,.45,0]}><cylinderGeometry args={[.42,.55,.9,8]}/><meshStandardMaterial color="#607d78" roughness={.75}/></mesh>
    {[-.35,0,.35].map((x,i)=><mesh key={i} position={[x,1.3,i===1?.08:-.08]}><icosahedronGeometry args={[.48,1]}/><meshStandardMaterial color={i===1?'#7bb184':'#5d9b70'} flatShading roughness={1}/></mesh>)}
    <mesh position={[0,1.8,0]}><icosahedronGeometry args={[.42,1]}/><meshStandardMaterial color="#87bb83" flatShading roughness={1}/></mesh>
  </group>;
}

function MainOffice() {
  const baseY=terrainHeight(0,0);
  const steps=Array.from({length:6},(_,i)=>{
    const z=9+i*1.65;
    return [terrainHeight(0,z)-baseY,z];
  });
  const lowerFront=[-7.1,-4.2,4.2,7.1];
  const upperFront=[-7.1,-4.2,4.2,7.1];
  const sides=[-5.1,-1.7,1.7,5.1];
  return <group position={[0,baseY,0]}>
    <mesh position={[0,.28,0]} receiveShadow castShadow><boxGeometry args={[21,.56,16.3]}/><meshStandardMaterial color="#89979a" roughness={.82}/></mesh>
    <mesh position={[0,.65,0]} receiveShadow><boxGeometry args={[17.8,.16,12.8]}/><meshStandardMaterial color="#aab9b8" metalness={.12} roughness={.32}/></mesh>
    {lowerFront.map((x,i)=><OfficeGlassPanel key={'lower'+i} position={[x,2.38,6.67]}/>)}
    <OfficeGlassPanel position={[0,2.38,6.72]} width={3.1} height={3.45}/>
    {upperFront.map((x,i)=><OfficeGlassPanel key={'upper'+i} position={[x,6.35,7.18]}/>)}
    <OfficeGlassPanel position={[0,6.35,7.23]} width={3.2} height={3.5}/>
    {sides.map((z,i)=><OfficeGlassPanel key={'left'+i} position={[-9.08,2.38,z]} rotationY={-Math.PI/2} width={3.05}/>)}
    {sides.map((z,i)=><OfficeGlassPanel key={'right'+i} position={[9.08,2.38,z]} rotationY={Math.PI/2} width={3.05}/>)}
    {sides.map((z,i)=><OfficeGlassPanel key={'upperleft'+i} position={[-9.82,6.35,z]} rotationY={-Math.PI/2} width={3.25}/>)}
    {sides.map((z,i)=><OfficeGlassPanel key={'upperright'+i} position={[9.82,6.35,z]} rotationY={Math.PI/2} width={3.25}/>)}
    <mesh position={[0,4.35,0]}><boxGeometry args={[19.8,.42,14.7]}/><meshStandardMaterial color="#d9e5e3" metalness={.6} roughness={.28}/></mesh>
    {[-9.8,9.8].map(x=><mesh key={'fin'+x} position={[x,4.4,7.21]} castShadow><boxGeometry args={[.24,8.4,.34]}/><meshStandardMaterial color="#e3ece9" metalness={.75} roughness={.22}/></mesh>)}
    <mesh position={[0,4.58,8.7]} castShadow receiveShadow><boxGeometry args={[12.8,.34,3.35]}/><meshStandardMaterial color="#d2dddd" metalness={.48} roughness={.3}/></mesh>
    {[-4.55,-1.52,1.52,4.55].map(x=><OfficeBalconyRail key={'rail'+x} x={x}/>)}
    {[-6.4,6.4].map(x=><mesh key={'sideRail'+x} position={[x,5.25,8.75]}><boxGeometry args={[.13,1.05,3.35]}/><meshStandardMaterial color="#cbd8d8" metalness={.72} roughness={.22}/></mesh>)}
    <mesh position={[0,4.07,7.7]} castShadow><boxGeometry args={[7,.2,2.2]}/><meshStandardMaterial color="#243c47" metalness={.65} roughness={.25}/></mesh>
    {[-2.8,2.8].map(x=><mesh key={'canopy'+x} position={[x,3.3,7.72]}><boxGeometry args={[.13,1.45,.13]}/><meshStandardMaterial color="#d8e4e2" metalness={.7} roughness={.25}/></mesh>)}
    <mesh position={[0,8.45,0]} castShadow><boxGeometry args={[20.4,.62,15.1]}/><meshStandardMaterial color="#d8e1df" metalness={.62} roughness={.26}/></mesh>
    <mesh position={[0,8.8,0]} castShadow><boxGeometry args={[18.8,.16,13.6]}/><meshStandardMaterial color="#2f5963" metalness={.6} roughness={.3}/></mesh>
    {[-5.4,-1.8,1.8,5.4].map(x=><group key={'solar'+x} position={[x,8.97,-1.8]} rotation-x={-.12}>
      <mesh><boxGeometry args={[3.15,.1,3.4]}/><meshStandardMaterial color="#264c69" metalness={.55} roughness={.22}/></mesh>
      {[-1,0,1].map(v=><mesh key={v} position={[v,.06,0]}><boxGeometry args={[.035,.025,3.35]}/><meshStandardMaterial color="#a9d6e4" metalness={.5} roughness={.25}/></mesh>)}
      <mesh position={[0,.06,0]}><boxGeometry args={[3.1,.025,.04]}/><meshStandardMaterial color="#a9d6e4" metalness={.5} roughness={.25}/></mesh>
    </group>)}
    <group position={[0,.65,0]}>
      <pointLight position={[0,3.1,-1]} color="#c3f0ff" intensity={1.6} distance={18}/>
      <pointLight position={[0,7.1,-1]} color="#e3f7ff" intensity={1.4} distance={18}/>
      <mesh position={[0,.12,2.4]}><boxGeometry args={[8,.08,4]}/><meshStandardMaterial color="#627f81" roughness={.9}/></mesh>
      <mesh position={[0,1.05,-2.25]}><boxGeometry args={[5.2,1.1,1.25]}/><meshStandardMaterial color="#d8e1de" roughness={.42}/></mesh>
      <mesh position={[0,1.68,-2.25]}><boxGeometry args={[5.35,.16,1.3]}/><meshStandardMaterial color="#87b8bb" roughness={.3}/></mesh>
      <mesh position={[0,1.72,-1.58]}><boxGeometry args={[4.8,.08,.12]}/><meshStandardMaterial color="#9be2e2" emissive="#51aab4" emissiveIntensity={.6}/></mesh>
      <OfficeSofa position={[-5.4,.08,-.15]}/>
      <OfficeSofa position={[5.4,.08,-.15]}/>
      <mesh position={[0,.58,.15]}><cylinderGeometry args={[1.15,1.15,.16,12]}/><meshStandardMaterial color="#e1e8e5" metalness={.24} roughness={.3}/></mesh>
      <mesh position={[0,.92,.15]}><cylinderGeometry args={[.18,.22,.55,8]}/><meshStandardMaterial color="#a9b9b7" metalness={.6} roughness={.25}/></mesh>
      <OfficePlant position={[-7.5,.12,-4.7]} scale={.8}/>
      <OfficePlant position={[7.5,.12,-4.7]} scale={.8}/>
    </group>
    <group position={[0,4.56,0]}>
      <mesh position={[0,.04,-1.3]}><boxGeometry args={[17.8,.1,12.8]}/><meshStandardMaterial color="#a8b7b7" metalness={.12} roughness={.32}/></mesh>
      <mesh position={[0,.14,-3.7]}><boxGeometry args={[7.3,.08,2.2]}/><meshStandardMaterial color="#56747a" roughness={.8}/></mesh>
      <mesh position={[0,.78,-3.5]}><boxGeometry args={[6.8,.18,2.05]}/><meshStandardMaterial color="#d5dfdd" roughness={.34}/></mesh>
      {[-2.7,-1.6,-.5,.6,1.7,2.8].map(x=><OfficeChair key={'conf'+x} position={[x,.16,-2.0]} rotationY={Math.PI}/>)}
      {[-6.1,-2.05,2.05,6.1].map((x,i)=><OfficeWorkstation key={'work'+i} position={[x,.16,1.1]}/>)}
      <OfficePlant position={[-8,.1,-5]} scale={.72}/>
      <OfficePlant position={[8,.1,-5]} scale={.72}/>
    </group>
    {[-1,1].map(side=><mesh key={'balconyLight'+side} position={[side*5.85,6.1,10.52]}>
      <boxGeometry args={[.18,.24,.18]}/><meshStandardMaterial color="#d7f5e9" emissive="#8ce0ce" emissiveIntensity={1.2}/>
    </mesh>)}
    {steps.map(([y,z],i)=><mesh key={'step'+i} position={[0,y+.11,z]} rotation-y={(i%2?-.04:.04)} receiveShadow>
      <boxGeometry args={[2.15,.2,1.35]}/><meshStandardMaterial color={i%2?'#bac7c6':'#d4dcdc'} roughness={.65}/>
    </mesh>)}
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
    <ambientLight intensity={.82}/>
    <hemisphereLight args={['#e8f8ff','#668c55',.62]}/>
    <directionalLight position={[-25,38,18]} intensity={1.9} castShadow shadow-mapSize={[2048,2048]}/>
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
    <MainOffice/>
  </>;
}

export default function App() {
  return <main className="app-shell">
    <Canvas shadows dpr={[1,1.5]} gl={{antialias:true,powerPreference:'high-performance'}}>
      <Scene/>
    </Canvas>
  </main>;
}
