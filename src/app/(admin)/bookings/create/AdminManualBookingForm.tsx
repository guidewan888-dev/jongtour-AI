'use client';
import React, { useState, useEffect } from 'react';

interface Props {
  customers: { id: string; name: string }[];
  tours: { id: string; name: string; basePrice: number }[];
  suppliers: { id: string; name: string }[];
}

export default function AdminManualBookingForm({ customers, tours, suppliers }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [customerId, setCustomerId] = useState('');
  const [tourId, setTourId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [pax, setPax] = useState(1);
  const [customPrice, setCustomPrice] = useState(0);
  const [internalNote, setInternalNote] = useState('');
  const [newBookingRef, setNewBookingRef] = useState('');
  
  const [travelers, setTravelers] = useState([{ title: 'Mr.', firstName: '', lastName: '', passport: '' }]);

  useEffect(() => {
    if (pax > travelers.length) {
      const diff = pax - travelers.length;
      setTravelers(prev => [...prev, ...Array(diff).fill({ title: 'Mr.', firstName: '', lastName: '', passport: '' })]);
    } else if (pax < travelers.length && pax > 0) {
      setTravelers(prev => prev.slice(0, pax));
    }
  }, [pax]);

  const handleTravelerChange = (index: number, field: string, value: string) => {
    setTravelers(prev => { const u = [...prev]; u[index] = { ...u[index], [field]: value }; return u; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/bookings/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, tourId, supplierId, departureDate, pax, customPrice, internalNote, travelers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ไม่สามารถสร้าง Booking ได้');
      setNewBookingRef(data.bookingRef);
      setIsSuccess(true);
      setTimeout(() => { window.location.href = `/bookings/${data.bookingRef}`; }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-800">
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <a href="/bookings" className="text-slate-400 hover:text-slate-900 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </a>
            <h1 className="text-xl font-black text-slate-800">Create Manual Booking</h1>
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-4xl w-full mx-auto pb-24">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 font-medium text-sm">{error}</div>}

          {isSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-2xl font-black text-emerald-800 mb-2">Booking Created! ({newBookingRef})</h2>
              <p className="text-slate-600 mb-6 font-medium">กำลัง redirect ไปหน้า Booking Detail...</p>
              <div className="w-8 h-8 mx-auto border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                  <h2 className="font-bold text-slate-800">Booking Details</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Customer *</label>
                    <select required value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="">-- Choose Customer --</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {customers.length === 0 && <p className="text-xs text-amber-600 mt-1">⚠️ ไม่พบลูกค้าที่ Active ในฐานข้อมูล</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Tour Package *</label>
                    <select required value={tourId} onChange={e => setTourId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="">-- Choose Tour --</option>
                      {tours.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    {tours.length === 0 && <p className="text-xs text-amber-600 mt-1">⚠️ ไม่พบทัวร์ Published ในฐานข้อมูล</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Wholesale Supplier *</label>
                    <select required value={supplierId} onChange={e => setSupplierId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="">-- Choose Supplier --</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Departure Date *</label>
                    <input type="date" required value={departureDate} onChange={e => setDepartureDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Number of Pax *</label>
                    <input type="number" min="1" required value={pax} onChange={e => setPax(parseInt(e.target.value) || 1)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Price (THB) *</label>
                    <input type="number" required value={customPrice} onChange={e => setCustomPrice(parseFloat(e.target.value) || 0)} className="w-full bg-orange-50 text-orange-900 border border-orange-200 rounded-xl px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                  <h2 className="font-bold text-slate-800">Traveler Information ({pax} Pax)</h2>
                </div>
                <div className="p-6 space-y-4">
                  {travelers.map((t, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border border-slate-100 bg-slate-50/50 rounded-xl relative">
                      <div className="absolute top-2 left-2 text-[10px] font-black text-slate-400 bg-slate-200 px-1.5 rounded">PAX {index + 1}</div>
                      <div className="md:w-24 mt-4 md:mt-0">
                        <select value={t.title} onChange={e => handleTravelerChange(index, 'title', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-500">
                          <option>Mr.</option><option>Mrs.</option><option>Ms.</option><option>Mstr.</option>
                        </select>
                      </div>
                      <div className="flex-1 mt-4 md:mt-0">
                        <input type="text" placeholder="First Name" value={t.firstName} onChange={e => handleTravelerChange(index, 'firstName', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-500" />
                      </div>
                      <div className="flex-1">
                        <input type="text" placeholder="Last Name" value={t.lastName} onChange={e => handleTravelerChange(index, 'lastName', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-500" />
                      </div>
                      <div className="flex-1">
                        <input type="text" placeholder="Passport No." value={t.passport} onChange={e => handleTravelerChange(index, 'passport', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-500 uppercase font-mono" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 rounded-3xl border border-yellow-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-yellow-100">
                  <h2 className="font-bold text-yellow-800">Internal Notes (Staff Only)</h2>
                </div>
                <div className="p-6">
                  <textarea value={internalNote} onChange={e => setInternalNote(e.target.value)} placeholder="Add special requests, payment arrangements, or internal instructions..." className="w-full bg-white border border-yellow-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 h-24"></textarea>
                </div>
              </div>

              <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-slate-200 p-4 px-8 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-30">
                <div className="text-sm">
                  <span className="text-slate-500 font-bold">Total Amount: </span>
                  <span className="text-xl font-black text-slate-900">฿{customPrice.toLocaleString()}</span>
                </div>
                <div className="flex gap-4">
                  <a href="/bookings" className="px-6 py-3 font-bold text-slate-600 hover:text-slate-900 transition-colors">Cancel</a>
                  <button type="submit" disabled={isLoading} className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2">
                    {isLoading ? <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : null}
                    {isLoading ? 'กำลังสร้าง...' : 'Create Booking'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
