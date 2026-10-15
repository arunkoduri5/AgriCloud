import { cloudEnabled, auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

const STORAGE_KEY = 'agrirent-demo-v1';
const seedEquipment = [
  { id:'tractor-1', name:'Mahindra 575 DI XP Plus', category:'Tractors', pricePerDay:1500, location:'Khammam, Telangana', description:'A dependable 47 HP tractor for ploughing, hauling, and everyday farm work.', image:'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=85', active:true, badge:'Popular' },
  { id:'harvester-1', name:'Kubota DC-68G Harvester', category:'Harvesters', pricePerDay:4200, location:'Warangal, Telangana', description:'Efficient paddy harvesting with a clean finish and reduced crop loss.', image:'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=900&q=85', active:true, badge:'High demand' },
  { id:'rotavator-1', name:'Shaktiman Regular Smart', category:'Land preparation', pricePerDay:950, location:'Suryapet, Telangana', description:'Strong rotary tiller for preparing seedbeds and breaking up compact soil.', image:'https://images.unsplash.com/photo-1592982537447-6f2a6a0f4e6a?auto=format&fit=crop&w=900&q=85', active:true },
  { id:'sprayer-1', name:'Battery Power Sprayer 20L', category:'Sprayers', pricePerDay:450, location:'Khammam, Telangana', description:'Lightweight sprayer for applying crop protection and nutrition products.', image:'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=900&q=85', active:true },
  { id:'cultivator-1', name:'Fieldking Tractor Cultivator', category:'Land preparation', pricePerDay:700, location:'Nalgonda, Telangana', description:'Prepares soil quickly between rows and helps manage weeds.', image:'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=85', active:true },
  { id:'thresher-1', name:'AgroPower Multi-Crop Thresher', category:'Harvesters', pricePerDay:1800, location:'Mahabubabad, Telangana', description:'Separates grain from stalks for several common crops.', image:'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=900&q=85', active:true },
];
const seedBookings = [];
function readDemo(){
  try {
    const x=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(x&&Array.isArray(x.equipment)&&Array.isArray(x.bookings)&&Array.isArray(x.users)) return x;
  } catch {}
  const x={equipment:seedEquipment,bookings:[],users:[]}; localStorage.setItem(STORAGE_KEY,JSON.stringify(x)); return x;
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
