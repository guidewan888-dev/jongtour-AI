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
      {/* Cover Page */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', color: '#f97316', marginBottom: '10px' }}>{itinerary.title}</h1>
        <div style={{ fontSize: '20px', color: '#666', marginBottom: '20px' }}>ราคาประเมิน: {itinerary.estimatedPrice}</div>
        <div style={{ borderBottom: '2px solid #f97316', width: '100px', margin: '0 auto' }}></div>
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
