import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function ReviewsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Mock reviews for demonstration
  const reviews = [
    {
      id: 'mock-review-1',
      rating: 5,
      content: 'ทัวร์จัดดีมากครับ ไกด์น่ารักดูแลดี อาหารอร่อยทุกมื้อ โรงแรมที่พักสะอาดและอยู่ใกล้แหล่งช้อปปิ้ง แนะนำเลยครับ ไม่ผิดหวังแน่นอน!',
      createdAt: new Date(),
      tour: {
        title: 'ทัวร์เกาหลี โซล นามิ สกีรีสอร์ท 5 วัน 3 คืน',
        destination: 'ประเทศเกาหลีใต้',
        imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=800&auto=format&fit=crop',
      }
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">รีวิวของฉัน</h1>
        {reviews.length > 0 && (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full border border-yellow-300">
            ข้อมูลตัวอย่าง
          </span>
        )}
      </div>
      
      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <div className="w-16 h-16 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">ยังไม่มีประวัติการรีวิว</h3>
          <p className="text-gray-500 text-sm">หลังจากเดินทางกลับจากทริป คุณสามารถแบ่งปันประสบการณ์ของคุณได้ที่นี่</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Tour Info */}
                <div className="w-full md:w-64 flex-shrink-0">
                  <div className="flex gap-3 mb-3">
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={review.tour.imageUrl} alt={review.tour.title} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-2">{review.tour.title}</h4>
                      <p className="text-xs text-gray-500">{review.tour.destination}</p>
                    </div>
                  </div>
                  <Link href="/user/bookings" className="text-sm text-[#5392f9] hover:underline font-medium">
                    ดูรายละเอียดทริป
                  </Link>
                </div>

                {/* Review Content */}
                <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star}
                          className={`w-5 h-5 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{review.createdAt.toLocaleDateString('th-TH')}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    "{review.content}"
                  </p>
                  
                  <div className="mt-4 flex gap-2">
                    {/* Dummy image slots if they uploaded photos */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-xs">ภาพ 1</div>
                    <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-xs">ภาพ 2</div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
