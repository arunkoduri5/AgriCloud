import { cloudEnabled, auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

const STORAGE_KEY = 'agrirent-demo-v1';
const seedEquipment = [
  {
    "id": "vehicle-1",
    "name": "Mahindra Tractor",
    "group": "Vehicles",
    "category": "Tractors",
    "pricePerHour": 800,
    "location": "Village A",
    "description": "Farm tractor for ploughing, tilling, and planting.",
    "image": "",
    "active": true
  },
  {
    "id": "vehicle-2",
    "name": "Sonalika Tractor",
    "group": "Vehicles",
    "category": "Tractors",
    "pricePerHour": 750,
    "location": "Village B",
    "description": "Farm tractor for ploughing, tilling, and planting.",
    "image": "",
    "active": true
  },
  {
    "id": "vehicle-3",
    "name": "Wheat Harvester",
    "group": "Vehicles",
    "category": "Harvesters",
    "pricePerHour": 1500,
    "location": "Village C",
    "description": "Harvesting machinery for field crops.",
    "image": "",
    "active": true
  },
  {
    "id": "vehicle-4",
    "name": "Rice Harvester",
    "group": "Vehicles",
    "category": "Harvesters",
    "pricePerHour": 1400,
    "location": "Village D",
    "description": "Harvesting machinery for field crops.",
    "image": "",
    "active": true
  },
  {
    "id": "vehicle-5",
    "name": "Sugarcane Cutter 1",
    "group": "Vehicles",
    "category": "Harvesters",
    "pricePerHour": 2000,
    "location": "Village E",
    "description": "Harvesting machinery for field crops.",
    "image": "",
    "active": true
  },
  {
    "id": "vehicle-6",
    "name": "Sugarcane Cutter 2",
    "group": "Vehicles",
    "category": "Harvesters",
    "pricePerHour": 2100,
    "location": "Village F",
    "description": "Harvesting machinery for field crops.",
    "image": "",
    "active": true
  },
  {
    "id": "vehicle-7",
    "name": "JCB Loader",
    "group": "Vehicles",
    "category": "JCB",
    "pricePerHour": 1800,
    "location": "Village G",
    "description": "Heavy machinery for digging, clearing, and earthwork.",
    "image": "",
    "active": true
  },
  {
    "id": "vehicle-8",
    "name": "JCB Excavator",
    "group": "Vehicles",
    "category": "JCB",
    "pricePerHour": 1700,
    "location": "Village H",
    "description": "Heavy machinery for digging, clearing, and earthwork.",
    "image": "",
    "active": true
  },
  {
    "id": "vehicle-9",
    "name": "Agricopter AG 365",
    "group": "Vehicles",
    "category": "Spraying",
    "pricePerHour": 2500,
    "location": "Nearby Village",
    "description": "Crop spraying machinery for agricultural applications.",
    "image": "",
    "active": true
  },
  {
    "id": "vehicle-10",
    "name": "STIHL SR430",
    "group": "Vehicles",
    "category": "Spraying",
    "pricePerHour": 500,
    "location": "Village Equipment Center",
    "description": "Crop spraying machinery for agricultural applications.",
    "image": "",
    "active": true
  },
  {
    "id": "equipment-1",
    "name": "Power Tiller",
    "group": "Equipment",
    "category": "Farm implements",
    "pricePerHour": 700,
    "location": "Location to be confirmed",
    "description": "Power Tiller for farm operations. Contact the administrator to confirm the pickup location.",
    "image": "",
    "active": true
  },
  {
    "id": "equipment-2",
    "name": "Seed Drill",
    "group": "Equipment",
    "category": "Farm implements",
    "pricePerHour": 400,
    "location": "Location to be confirmed",
    "description": "Seed Drill for farm operations. Contact the administrator to confirm the pickup location.",
    "image": "",
    "active": true
  },
  {
    "id": "equipment-3",
    "name": "Rotavator",
    "group": "Equipment",
    "category": "Farm implements",
    "pricePerHour": 900,
    "location": "Location to be confirmed",
    "description": "Rotavator for farm operations. Contact the administrator to confirm the pickup location.",
    "image": "",
    "active": true
  },
  {
    "id": "equipment-4",
    "name": "Cultivator",
    "group": "Equipment",
    "category": "Farm implements",
    "pricePerHour": 500,
    "location": "Location to be confirmed",
    "description": "Cultivator for farm operations. Contact the administrator to confirm the pickup location.",
    "image": "",
    "active": true
  },
  {
    "id": "equipment-5",
    "name": "Disc Harrow",
    "group": "Equipment",
    "category": "Farm implements",
    "pricePerHour": 600,
    "location": "Location to be confirmed",
    "description": "Disc Harrow for farm operations. Contact the administrator to confirm the pickup location.",
    "image": "",
    "active": true
  },
  {
    "id": "equipment-6",
    "name": "Plough",
    "group": "Equipment",
    "category": "Farm implements",
    "pricePerHour": 450,
    "location": "Location to be confirmed",
    "description": "Plough for farm operations. Contact the administrator to confirm the pickup location.",
    "image": "",
    "active": true
  },
  {
    "id": "equipment-7",
    "name": "Paddy Transplanter",
    "group": "Equipment",
    "category": "Farm implements",
    "pricePerHour": 1200,
    "location": "Location to be confirmed",
    "description": "Paddy Transplanter for farm operations. Contact the administrator to confirm the pickup location.",
    "image": "",
    "active": true
  },
  {
    "id": "equipment-8",
    "name": "Reaper",
    "group": "Equipment",
    "category": "Farm implements",
    "pricePerHour": 800,
    "location": "Location to be confirmed",
    "description": "Reaper for farm operations. Contact the administrator to confirm the pickup location.",
    "image": "",
    "active": true
  },
  {
    "id": "equipment-9",
    "name": "Threshing Machine",
    "group": "Equipment",
    "category": "Farm implements",
    "pricePerHour": 1000,
    "location": "Location to be confirmed",
    "description": "Threshing Machine for farm operations. Contact the administrator to confirm the pickup location.",
    "image": "",
    "active": true
  }
];
const seedBookings = [];
function readDemo(){
  try {
    const x=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(x&&Array.isArray(x.equipment)&&Array.isArray(x.bookings)&&Array.isArray(x.users)){ if(x.catalogVersion!==2){x.equipment=seedEquipment;x.catalogVersion=2;localStorage.setItem(STORAGE_KEY,JSON.stringify(x));} return x; }
  } catch {}
  const x={catalogVersion:2,equipment:seedEquipment,bookings:[],users:[]}; localStorage.setItem(STORAGE_KEY,JSON.stringify(x)); return x;
}
function writeDemo(x){localStorage.setItem(STORAGE_KEY,JSON.stringify(x)); window.dispatchEvent(new Event('agrirent-change'));}
export const isCloud = cloudEnabled;
export async function registerUser(name,email,password){
  if(cloudEnabled){const cred=await createUserWithEmailAndPassword(auth,email,password); await setDoc(doc(db,'users',cred.user.uid),{uid:cred.user.uid,name,email,role:'farmer',createdAt:new Date().toISOString()}); return {uid:cred.user.uid,name,email,role:'farmer'};}
  const x=readDemo(); if(x.users.some(u=>u.email.toLowerCase()===email.toLowerCase())) throw new Error('An account with this email already exists.');
  const u={uid:crypto.randomUUID(),name,email,role:'farmer',password}; x.users.push(u); writeDemo(x); return u;
}
export async function loginUser(email,password,role){
  if(cloudEnabled){const cred=await signInWithEmailAndPassword(auth,email,password); const snap=await getDoc(doc(db,'users',cred.user.uid)); const profile=snap.exists()?snap.data():{uid:cred.user.uid,email:cred.user.email,role:'farmer'}; if(role==='admin'&&profile.role!=='admin') throw new Error('This account is not assigned the administrator role.'); return profile;}
  if(role==='admin') return {uid:'demo-admin',name:'Platform Admin',email:'admin@agrirent.demo',role:'admin'};
  const x=readDemo(); const u=x.users.find(v=>v.email.toLowerCase()===email.toLowerCase()&&v.password===password); if(!u) throw new Error('Email or password is incorrect. Register first or use the demo admin account.'); return u;
}
export async function logoutUser(){if(cloudEnabled) await signOut(auth);}
export async function listEquipment(){if(cloudEnabled){const s=await getDocs(collection(db,'equipment')); return s.docs.map(d=>({id:d.id,...d.data()}));} return readDemo().equipment;}
export async function listBookings(user){if(cloudEnabled){const base=collection(db,'bookings'); const q=user.role==='admin'?base:query(base,where('userId','==',user.uid)); const s=await getDocs(q); return s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));} const all=readDemo().bookings; return user.role==='admin'?all:all.filter(b=>b.userId===user.uid);}
export async function saveBooking(b){if(cloudEnabled){const ref=await addDoc(collection(db,'bookings'),{...b,createdAt:new Date().toISOString()});return {id:ref.id,...b};} const x=readDemo();const item={...b,id:crypto.randomUUID(),createdAt:new Date().toISOString()};x.bookings.unshift(item);writeDemo(x);return item;}
export async function setBookingStatus(id,status){if(cloudEnabled){await updateDoc(doc(db,'bookings',id),{status,updatedAt:new Date().toISOString()});return;}const x=readDemo();x.bookings=x.bookings.map(b=>b.id===id?{...b,status}:b);writeDemo(x);}
export async function saveEquipment(item){if(cloudEnabled){if(item.id) await setDoc(doc(db,'equipment',item.id),item); else await addDoc(collection(db,'equipment'),{...item,active:true});return;}const x=readDemo(); if(item.id)x.equipment=x.equipment.map(e=>e.id===item.id?item:e);else x.equipment.unshift({...item,id:crypto.randomUUID(),active:true});writeDemo(x);}
export async function deleteEquipment(id){if(cloudEnabled){await deleteDoc(doc(db,'equipment',id));return;}const x=readDemo();x.equipment=x.equipment.filter(e=>e.id!==id);writeDemo(x);}
export function subscribeDemoRefresh(cb){if(!cloudEnabled){window.addEventListener('agrirent-change',cb);return()=>window.removeEventListener('agrirent-change',cb);}return()=>{};}
export function getSeedEquipment(){return seedEquipment;}
