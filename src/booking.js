export const STATUSES = ['Pending', 'Approved', 'In use', 'Completed', 'Rejected', 'Cancelled'];
export const JOURNEY = ['Pending', 'Approved', 'In use', 'Completed'];
export const BLOCKING = ['Approved', 'In use'];
export const TRANSITIONS = {Pending: ['Approved', 'Rejected', 'Cancelled'], Approved: ['In use', 'Cancelled'], 'In use': ['Completed'], Completed: [], Rejected: [], Cancelled: []};
export const money = n => new Intl.NumberFormat('en-IN', {style: 'currency', currency: 'INR', maximumFractionDigits: 0}).format(Number(n) || 0);
export function localDate() { return new Intl.DateTimeFormat('en-CA', {year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); }
export function dateLabel(date, lang='en') { if(!date) return '—'; return new Intl.DateTimeFormat(lang==='te'?'te-IN':'en-IN', {day:'numeric',month:'short',year:'numeric'}).format(new Date(date+'T12:00:00')); }
export function statusClass(status) { return status.toLowerCase().replaceAll(' ', '-'); }
export function conflictsWith(bookings, equipmentId, startDate, endDate, excludeId) { return bookings.some(b => b.id!==excludeId && b.equipmentId===equipmentId && BLOCKING.includes(b.status) && startDate<=b.endDate && endDate>=b.startDate); }
export function calculateBooking({startDate,endDate,hours,pricePerHour}, today=localDate()) {
  const start=new Date(startDate+'T00:00:00Z'), end=new Date(endDate+'T00:00:00Z');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(startDate)||!/^\d{4}-\d{2}-\d{2}$/.test(endDate)||!Number.isFinite(+start)||!Number.isFinite(+end)||start.toISOString().slice(0,10)!==startDate||end.toISOString().slice(0,10)!==endDate) throw new Error('Choose valid start and end dates.');
  if(startDate<today) throw new Error('Choose today or a future date.');
  const days=Math.round((end-start)/86400000)+1;
  if(days<1) throw new Error('End date must be on or after the start date.');
  if(!Number.isInteger(Number(hours))||Number(hours)<1) throw new Error('Enter a whole number of rental hours.');
  if(Number(hours)>days*24) throw new Error('Rental hours exceed the selected date range.');
  if(!Number.isFinite(Number(pricePerHour))||Number(pricePerHour)<=0) throw new Error('The rental rate is unavailable.');
  return {days,hours:Number(hours),totalPrice:Number(hours)*Number(pricePerHour)};
}
