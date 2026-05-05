import { NextResponse } from 'next/server';

const addons = [
  { key: 'translation', name: 'แปลเอกสาร', price: 800, unit: 'ฉบับ', icon: '📝' },
  { key: 'dummy_ticket', name: 'ตั๋ว Dummy', price: 500, unit: 'คน', icon: '✈️' },
  { key: 'dummy_hotel', name: 'โรงแรม Dummy', price: 300, unit: 'คืน', icon: '🏨' },
  { key: 'insurance', name: 'ประกันเดินทาง', price: 1200, unit: 'คน', icon: '🛡️' },
  { key: 'cover_letter', name: 'Cover Letter', price: 1500, unit: 'ฉบับ', icon: '📄' },
  { key: 'itinerary', name: 'แผนการเดินทาง', price: 1000, unit: 'ฉบับ', icon: '🗺️' },
  { key: 'interview_prep', name: 'ซ้อมสัมภาษณ์', price: 3000, unit: 'ครั้ง', icon: '🎤' },
  { key: 'express', name: 'ดำเนินการเร่งด่วน', price: 2000, unit: 'คำขอ', icon: '⚡' },
];

const bundles = [
  { key: 'quick_submit', name: 'Quick Submit Bundle', items: ['dummy_ticket', 'dummy_hotel', 'insurance'], originalPrice: 2000, price: 1700, discount: '15%' },
  { key: 'doc_master', name: 'Document Master Bundle', items: ['translation', 'translation', 'translation', 'cover_letter'], originalPrice: 3900, price: 3100, discount: '20%' },
  { key: 'full_service', name: 'Full Service Bundle', items: ['translation', 'dummy_ticket', 'dummy_hotel', 'insurance', 'cover_letter', 'itinerary'], originalPrice: 5800, price: 4500, discount: '22%' },
];

export async function GET() {
  return NextResponse.json({ success: true, data: { addons, bundles } });
}
