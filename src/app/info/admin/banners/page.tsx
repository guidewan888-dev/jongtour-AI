'use client';
import { Button } from '@/components/ui/Button';
import { Plus, Image as ImageIcon, Trash2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function BannersManagerPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">จัดการป้ายโฆษณา (Banners)</h1>
          <p className="text-slate-400">อัปโหลดรูปภาพเพื่อแสดงผลในหน้า Promotions</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> เพิ่มแบนเนอร์ใหม่
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden group">
            <div className="h-48 bg-slate-900 relative flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-slate-700" />
              <div className="absolute top-3 left-3">
                <Badge variant={item === 1 ? 'success' : 'neutral'}>
                  {item === 1 ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-white mb-1">แบนเนอร์โปรโมชั่นที่ {item}</h3>
              <p className="text-sm text-slate-400 mb-4">ลิงก์: https://tour.jongtour.com/promo{item}</p>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Edit className="w-4 h-4 mr-2" /> แก้ไข
                </Button>
                <Button variant="danger" className="px-3 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-900">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
