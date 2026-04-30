"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function WriteReviewForm({ booking, isMock }: { booking: any, isMock: boolean }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("กรุณาให้คะแนนความพึงพอใจ (ดาว) ก่อนส่งรีวิวครับ");
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">ขอบคุณสำหรับรีวิว!</h2>
        <p className="text-gray-500 mb-8">เราได้บันทึกความทรงจำดีๆ ของคุณไว้แล้ว</p>
        
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white mb-8 shadow-lg inline-block text-center transform scale-110">
          <p className="text-yellow-100 text-sm font-bold mb-1">คุณได้รับรางวัล</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-extrabold">+100</span>
            <span className="text-xl font-bold">Coins</span>
          </div>
          <p className="text-xs text-yellow-100 mt-2">สำหรับใช้เป็นส่วนลดในทริปถัดไป</p>
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/user/reviews" className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
            ดูรีวิวของฉัน
          </Link>
          <Link href="/user/rewards" className="px-6 py-3 bg-[#5392f9] text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-colors">
            ตรวจสอบ Coins ของฉัน
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/user/bookings" className="text-gray-400 hover:text-gray-600 transition-colors bg-white p-2 rounded-full border border-gray-200 shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">เขียนรีวิวทริปของคุณ</h1>
          {isMock && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full border border-yellow-300">โหมดตัวอย่าง</span>}
        </div>
        
        <div className="bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm animate-pulse">
          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm1-5h2a1 1 0 010 2H7a1 1 0 010-2h2V7a1 1 0 112 0v4z" clipRule="evenodd" fillRule="evenodd" />
          </svg>
          <span className="text-orange-700 font-bold text-sm">รีวิวเพื่อรับ 100 Coins!</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50/50 border-b border-gray-100">
          <div className="w-full sm:w-32 h-24 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 shadow-sm">
            {booking.departure.tour.imageUrl ? (
              <Image src={booking.departure.tour.imageUrl} alt={booking.departure.tour.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">ไม่มีรูปภาพ</div>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="font-bold text-gray-900 text-lg line-clamp-2 mb-1">{booking.departure.tour.title}</h2>
            <p className="text-sm text-gray-500 mb-1">{booking.departure.tour.destination}</p>
            <p className="text-xs text-gray-400">เดินทาง: {new Date(booking.departure.startDate).toLocaleDateString('th-TH')} - {new Date(booking.departure.endDate).toLocaleDateString('th-TH')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          
          {/* Star Rating */}
          <div className="mb-8 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-4">คุณประทับใจทริปนี้แค่ไหน?</h3>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <svg 
                    className={`w-12 h-12 transition-colors duration-200 ${
                      star <= (hoverRating || rating) 
                        ? 'text-yellow-400 drop-shadow-sm' 
                        : 'text-gray-200'
                    }`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            <div className="h-6 mt-2">
              <span className="text-sm font-medium text-gray-500">
                {rating === 1 && "ไม่ประทับใจเลย"}
                {rating === 2 && "มีข้อบกพร่องเยอะ"}
                {rating === 3 && "ก็โอเค ทั่วไป"}
                {rating === 4 && "ดีมาก ประทับใจ"}
                {rating === 5 && "สุดยอด! ดีเยี่ยมทุกอย่าง"}
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">แบ่งปันประสบการณ์ของคุณ (ไม่บังคับ)</label>
            <textarea
              rows={5}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="ไกด์ดูแลดีมากไหม? อาหารอร่อยหรือเปล่า? เล่าให้เราฟังหน่อยสิ..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5392f9] focus:border-transparent outline-none resize-none transition-shadow"
            />
          </div>

          {/* Image Upload Dummy */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">เพิ่มรูปภาพความทรงจำ (สูงสุด 5 รูป)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-blue-50 text-[#5392f9] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">คลิกเพื่ออัปโหลดรูปภาพ</p>
              <p className="text-xs text-gray-400 mt-1">รองรับ JPG, PNG ขนาดไม่เกิน 5MB</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
              isSubmitting || rating === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                : 'bg-[#5392f9] text-white hover:bg-blue-600 shadow-blue-500/30'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังส่งรีวิว...
              </span>
            ) : "ส่งรีวิวความประทับใจ"}
          </button>
        </form>
      </div>
    </div>
  );
}
