import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {calculateBooking,conflictsWith,localDate,TRANSITIONS} from '../src/booking.js';
import {translate} from '../src/i18n.js';
const require=createRequire(import.meta.url),{build}=require('esbuild'),postcss=require('postcss');
const checks=[];
function check(name,fn){fn();checks.push(name)}
const today='2026-10-15';
check('hourly cost and date boundaries',()=>{assert.deepEqual(calculateBooking({startDate:today,endDate:today,hours:'4',pricePerHour:800},today),{days:1,hours:4,totalPrice:3200});assert.equal(calculateBooking({startDate:today,endDate:'2026-10-16',hours:36,pricePerHour:500},today).totalPrice,18000);assert.throws(()=>calculateBooking({startDate:today,endDate:today,hours:25,pricePerHour:800},today));assert.throws(()=>calculateBooking({startDate:'2026-10-14',endDate:today,hours:2,pricePerHour:800},today));assert.throws(()=>calculateBooking({startDate:today,endDate:today,hours:1.5,pricePerHour:800},today));assert.throws(()=>calculateBooking({startDate:today,endDate:'2026-10-14',hours:1,pricePerHour:800},today));});
check('in-use rentals block approval; closed requests do not',()=>{const b={id:'b1',equipmentId:'e1',startDate:today,endDate:'2026-10-17',status:'In use'};assert(conflictsWith([b],'e1','2026-10-17','2026-10-18'));assert(!conflictsWith([b],'e1','2026-10-18','2026-10-19'));assert(!conflictsWith([b],'e1',today,today,'b1'));assert(!conflictsWith([{...b,status:'Cancelled'}],'e1',today,today));assert(!conflictsWith([b],'e2',today,today));assert(!conflictsWith([{...b,status:'Completed'}],'e1',today,today));});
check('lifecycle and Telugu labels',()=>{assert(TRANSITIONS.Approved.includes('In use'));assert(TRANSITIONS['In use'].includes('Completed'));assert.deepEqual(TRANSITIONS.Completed,[]);assert.notEqual(translate('Review cost','te'),'Review cost');assert.match(localDate(),/^\d{4}-\d{2}-\d{2}$/);});
const css=await fs.readFile(new URL('../src/readable.css',import.meta.url),'utf8');postcss.parse(css);checks.push('responsive stylesheet parses');
const tmp=path.resolve('.openai/verify-bundle.mjs');
await build({stdin:{contents:`export * from './src/ui.jsx';export * from './src/data.js';export {default as App} from './src/App.jsx';export {default as React} from 'react';export {renderToStaticMarkup} from 'react-dom/server';`,resolveDir:process.cwd(),loader:'jsx'},bundle:true,packages:'external',platform:'node',format:'esm',outfile:tmp,define:{'import.meta.env':'{}'},logLevel:'silent'});
const store=new Map(), listeners=new Map();
globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
globalThis.window={addEventListener:(k,fn)=>listeners.set(k,fn),removeEventListener:()=>{},dispatchEvent:e=>listeners.get(e.type)?.()};
try{
 const m=await import(pathToFileURL(tmp));
 const items=await m.listEquipment(),farmers=await m.listFarmers({role:'admin'}),admin={uid:'demo-admin',role:'admin'},initial=await m.listBookings(admin);
 check('all existing demo fixtures remain available',()=>{assert.equal(items.filter(x=>x.group==='Vehicles').length,10);assert.equal(items.filter(x=>x.group==='Equipment').length,9);assert.equal(farmers.length,20);assert.equal(initial.length,40)});
 const farmer=await m.loginUser('farmer01@agrirent.demo','demo1234','farmer');assert(!('password' in farmer));
 const b=await m.saveBooking({userId:farmer.uid,userName:farmer.name,equipmentId:items[0].id,equipmentName:items[0].name,startDate:today,endDate:today,hours:4,totalPrice:3200,status:'Pending'});
 await m.setBookingStatus(b.id,'Approved');await m.setBookingStatus(b.id,'In use');await m.setBookingStatus(b.id,'Completed');
 assert.equal((await m.listBookings(farmer)).find(x=>x.id===b.id).status,'Completed');
 const cancelled=await m.saveBooking({...b,id:undefined,status:'Pending'});await m.setBookingStatus(cancelled.id,'Cancelled','Field work rescheduled');assert.equal((await m.listBookings(farmer)).find(x=>x.id===cancelled.id).statusReason,'Field work rescheduled');
 await m.saveFarmerProfile(farmer,{primaryCrop:'Paddy',location:'Test village',role:'admin'});const reloaded=await m.loginUser('farmer01@agrirent.demo','demo1234','farmer');assert.equal(reloaded.primaryCrop,'Paddy');assert.equal(reloaded.role,'farmer');
 checks.push('demo login, booking updates, reasons, profile edits and role protection');
 const h=m.React.createElement,render=(Component,props,lang='en')=>m.renderToStaticMarkup(h(m.LanguageContext.Provider,{value:lang},h(Component,props)));
 const card=render(m.EquipmentCard,{item:items[0],onClick:()=>{}});assert(card.includes('View details'));assert(!card.includes('3D'));assert(card.includes('flat 2D illustration'));
 for(const status of ['Pending','Approved','In use','Completed','Rejected','Cancelled']){const html=render(m.BookingDetail,{booking:{...initial[0],status},equipment:items,user:admin,admin:true,onClose(){},onStatus(){},onInspect(){}});assert(html.includes(status));}
 const wizard=render(m.BookingWizard,{item:items[0],user:farmer,onClose(){},onSubmit(){},onLogin(){},onBookings(){}});assert(wizard.includes('Review cost'));assert(wizard.includes('Rental summary'));assert(wizard.includes('₹3,200'));assert(wizard.includes('aria-modal="true"'));
 const profile=render(m.FarmerProfile,{farmer,bookings:initial,onBooking(){}});assert(profile.includes('Farm information'));assert(profile.includes('Booking history'));assert(profile.includes('profile-booking'));
 const telugu=render(m.EquipmentCard,{item:items[0],onClick(){}},'te');assert(telugu.includes('వివరాలు చూడండి'));
 const home=render(m.App,{});assert(home.includes('Browse Vehicles'));assert(home.includes('Browse Equipment'));assert(home.includes('indian-winter-sunrise.webp'));assert(home.includes('mobile-bottom-nav'));
 checks.push('home, 2D cards, wizard, six booking states, profiles and Telugu render without errors');
}finally{await fs.rm(tmp,{force:true});}
console.log(checks.map(x=>'PASS '+x).join('\n'));
