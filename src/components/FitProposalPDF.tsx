import React from "react";

export const FitProposalPDF = React.forwardRef<HTMLDivElement, { itinerary: any }>(({ itinerary }, ref) => {
  if (!itinerary) return null;

  return (
    <div 
      ref={ref} 
      style={{ 
        width: '800px', 
        padding: '40px', 
        backgroundColor: '#fff', 
        color: '#333', 
        fontFamily: 'sans-serif',
        position: 'absolute',
        top: '-10000px',
        left: '-10000px'
      }}
    >
      {/* Ultra-Premium Cover Banner */}
      <div style={{ position: 'relative', width: '100%', height: '400px', marginBottom: '40px', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#fff5f5', borderBottom: '1px solid #fee2e2' }}>
        {/* Background Gradient */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, #fff7ed 0%, #ffe4e6 100%)' }}></div>
        
        {/* Left Side Content */}
        <div style={{ position: 'absolute', top: '40px', left: '40px', width: '50%', zIndex: 10 }}>
          {itinerary.marketingHeadline && (
            <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#ea580c', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px' }}>
              🔥 {itinerary.marketingHeadline}
            </div>
          )}
          
          <h1 style={{ fontSize: '32px', margin: '0 0 10px 0', lineHeight: '1.2', color: '#111827' }}>
            {itinerary.title}
          </h1>

          {/* Highlights */}
          {itinerary.highlights?.length > 0 && (
            <div style={{ backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid #fbcfe8', padding: '15px', borderRadius: '12px', marginTop: '20px' }}>
               <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: '10px' }}>✨ Tour Highlights</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 {itinerary.highlights.map((hl: string, i: number) => (
                   <div key={i} style={{ fontSize: '14px', color: '#1f2937', fontWeight: 'bold' }}>
                      <span style={{ color: '#22c55e', marginRight: '6px' }}>✔️</span> {hl}
                   </div>
                 ))}
               </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '25px' }}>
            {itinerary.durationText && (
              <div style={{ backgroundColor: '#111827', color: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                {itinerary.durationText}
              </div>
            )}
            {itinerary.airlineCode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', border: '1px solid #e5e7eb', padding: '6px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>เดินทางกับ</span>
                <img 
                  src={`https://images.kiwi.com/airlines/64/${itinerary.airlineCode}.png`} 
                  alt={itinerary.airlineCode}
                  style={{ height: '16px' }}
                  crossOrigin="anonymous"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side Polaroid Collage */}
        <div style={{ position: 'absolute', top: '20px', right: '40px', width: '350px', height: '100%' }}>
          {/* Day 1 Photo */}
          {itinerary.days?.[0]?.imagePrompt && (
            <div style={{ position: 'absolute', top: '100px', left: '-50px', width: '180px', height: '150px', backgroundColor: 'white', padding: '8px 8px 30px 8px', borderRadius: '4px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', transform: 'rotate(-5deg)', zIndex: 1 }}>
              <img src={`https://image.pollinations.ai/prompt/${encodeURIComponent(itinerary.days[0].imagePrompt)}?width=400&height=300&nologo=true`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous"/>
            </div>
          )}
          {/* Day 2 Photo */}
          {itinerary.days?.[1]?.imagePrompt && (
            <div style={{ position: 'absolute', top: '160px', right: '20px', width: '180px', height: '150px', backgroundColor: 'white', padding: '8px 8px 30px 8px', borderRadius: '4px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', transform: 'rotate(10deg)', zIndex: 2 }}>
              <img src={`https://image.pollinations.ai/prompt/${encodeURIComponent(itinerary.days[1].imagePrompt)}?width=400&height=300&nologo=true`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous"/>
            </div>
          )}
          {/* Main Cover */}
          <div style={{ position: 'absolute', top: '20px', left: '30px', width: '250px', height: '180px', backgroundColor: 'white', padding: '8px 8px 35px 8px', borderRadius: '4px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)', transform: 'rotate(3deg)', zIndex: 3 }}>
            <img src={itinerary.coverImagePrompt ? `https://image.pollinations.ai/prompt/${encodeURIComponent(itinerary.coverImagePrompt)}?width=600&height=400&nologo=true` : "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous"/>
            <div style={{ position: 'absolute', bottom: '10px', width: '100%', textAlign: 'center', fontSize: '10px', color: '#9ca3af' }}>Amazing Trip</div>
          </div>
        </div>

        {/* Price Tag (Bottom Right) */}
        <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 10, textAlign: 'right' }}>
           <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>ราคาประเมินเริ่มต้น</div>
           <div style={{ backgroundColor: '#ea580c', color: 'white', padding: '8px 20px', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', border: '1px solid #fdba74', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
             {itinerary.estimatedPrice}
           </div>
        </div>
      </div>

      {/* Itinerary Days */}
      {itinerary.days?.map((day: any, idx: number) => (
        <div key={idx} style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: '#f97316', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', flexShrink: 0 }}>
              {day.day}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '20px', color: '#1f2937', marginBottom: '10px', marginTop: '10px' }}>{day.title}</h3>
              <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '15px' }}>{day.detail}</p>
              
              <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#6b7280', marginBottom: '15px', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '8px' }}>
                <div><strong>อาหาร:</strong> {day.meals?.breakfast ? 'เช้า' : '-'} / {day.meals?.lunch ? 'กลางวัน' : '-'} / {day.meals?.dinner ? 'เย็น' : '-'}</div>
                <div><strong>โรงแรม:</strong> {day.hotel || '-'}</div>
              </div>

              {day.imagePrompt && (
                <img 
                  src={`https://image.pollinations.ai/prompt/${encodeURIComponent(day.imagePrompt + ", travel photography, beautiful scenery, 4k, hyperrealistic")}?width=600&height=300&nologo=true`} 
                  alt={day.title}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px' }}
                  crossOrigin="anonymous"
                />
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Inclusions & Exclusions */}
      <div style={{ display: 'flex', gap: '30px', marginTop: '40px', pageBreakInside: 'avoid' }}>
        <div style={{ flex: 1, backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '12px' }}>
          <h4 style={{ color: '#16a34a', marginBottom: '15px', fontWeight: 'bold' }}>สิ่งที่รวมในราคาทัวร์</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>
            {itinerary.inclusions?.map((inc: string, i: number) => <li key={i}>{inc}</li>)}
          </ul>
        </div>
        <div style={{ flex: 1, backgroundColor: '#fef2f2', padding: '20px', borderRadius: '12px' }}>
          <h4 style={{ color: '#dc2626', marginBottom: '15px', fontWeight: 'bold' }}>สิ่งที่ไม่รวมในราคาทัวร์</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>
            {itinerary.exclusions?.map((exc: string, i: number) => <li key={i}>{exc}</li>)}
          </ul>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '40px', color: '#9ca3af', fontSize: '12px' }}>
        Created automatically by Jongtour AI Planner
      </div>
    </div>
  );
});

FitProposalPDF.displayName = "FitProposalPDF";
