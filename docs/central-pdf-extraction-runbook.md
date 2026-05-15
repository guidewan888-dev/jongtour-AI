# Central PDF Extraction Runbook

## เป้าหมาย
- ดึงข้อมูลราคา/มัดจำ/พักเดี่ยว/เด็ก/ทารก จาก PDF ทุก wholesaler แบบไม่ timeout
- เก็บข้อมูลเข้าระบบกลาง (`tour_prices`) และตรวจ completeness ราย departure

## โครงหลัก
- Queue table: `pdf_extraction_jobs`
- Worker service:
  - `enqueuePdfExtractionJobs()`
  - `processPdfExtractionQueue()`
- Completeness report:
  - `getDepartureCompletenessReport()`

## API ที่ใช้
- Enqueue jobs:
  - `POST /api/admin/central-wholesale/pdf-queue/enqueue`
- Process worker chunk:
  - `POST /api/admin/central-wholesale/pdf-queue/worker`
- Completeness report:
  - `GET /api/admin/central-wholesale/completeness`
- Cron worker:
  - `GET /api/cron/central-pdf-extraction?batchSize=25&maxRuntimeMs=240000`

## ตัวอย่าง payload
```json
{
  "wholesalerId": "SUP_LETGO",
  "onlyMissingPricing": true,
  "force": false,
  "limit": 20000
}
```

```json
{
  "wholesalerId": "SUP_LETGO",
  "batchSize": 40,
  "maxRuntimeMs": 240000
}
```

## วิธีใช้งานประจำวัน (แนะนำ)
1. Sync wholesaler ปกติ (`/api/admin/central-wholesale/sync`)
2. Enqueue PDF jobs เฉพาะรายการที่ยังขาด
3. รัน worker chunk ซ้ำจน `queue.pending + queue.retry = 0`
4. เปิดรายงาน completeness แล้วเคลียร์รายการ missing fields

## การรองรับอนาคตเมื่อ API ต้นทางเปลี่ยน
- ใช้ extraction แบบผสม:
  - PaxType จากตารางราคาเดิม
  - Structured key matching จาก raw payload
  - Context extraction จาก PDF
- ถ้า field map เปลี่ยน:
  - เพิ่ม key pattern ใน `extractStructuredPriceFromPayload()`
  - verify ด้วย completeness report ว่า missing ลดลงจริง

