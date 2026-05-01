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
      {/* Cover Banner */}
      <div style={{ position: 'relative', width: '100%', height: '350px', marginBottom: '40px', borderRadius: '16px', overflow: 'hidden' }}>
        <img 
          src={itinerary.coverImagePrompt 
            ? `https://image.pollinations.ai/prompt/${encodeURIComponent(itinerary.coverImagePrompt + ", travel photography, beautiful scenery, 4k, hyperrealistic")}?width=1200&height=500&nologo=true`
            : "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80"}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt="Cover"
          crossOrigin="anonymous"
        />
        {/* Dark Gradient Overlay equivalent for PDF */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.1) 100%)' }}></div>
        
        {/* Banner Text */}
        <div style={{ position: 'absolute', bottom: '30px', left: '30px', right: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', color: 'white' }}>
          <div style={{ flex: 1, paddingRight: '20px' }}>
            {itinerary.marketingHeadline && (
              <div style={{ display: 'inline-block', backgroundColor: '#f97316', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' }}>
                🔥 {itinerary.marketingHeadline}
              </div>
            )}
            <h1 style={{ fontSize: '38px', margin: '0 0 10px 0', lineHeight: '1.2', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              ✨ {itinerary.title}
            </h1>
            {itinerary.airlineCode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', width: 'fit-content' }}>
                <span style={{ fontSize: '14px' }}>เดินทางกับ</span>
                <img 
                  src={`https://images.kiwi.com/airlines/64/${itinerary.airlineCode}.png`} 
                  alt={itinerary.airlineCode}
                  style={{ height: '24px', backgroundColor: 'white', padding: '2px', borderRadius: '4px' }}
                  crossOrigin="anonymous"
                />
              </div>
            )}
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>ราคาประเมินเริ่มต้น</div>
            <div style={{ backgroundColor: 'white', color: '#ea580c', padding: '10px 20px', borderRadius: '12px', fontSize: '24px', fontWeight: 'bold', borderBottom: '4px solid #fed7aa', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
              {itinerary.estimatedPrice}
            </div>
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
