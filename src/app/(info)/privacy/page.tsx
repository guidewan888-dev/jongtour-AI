import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว",
  description: "นโยบายความเป็นส่วนตัวและการปกป้องข้อมูลส่วนบุคคลของ Jongtour",
};

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-white border-b border-slate-100">
        <div className="g-container py-16 md:py-20">
          <div className="g-badge-primary mb-4">Legal</div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">นโยบายความเป็นส่วนตัว</h1>
          <p className="text-sm text-slate-400">อัปเดตล่าสุด: 1 มกราคม 2569</p>
        </div>
      </section>

      <section className="g-section bg-background">
        <div className="g-container-narrow">
          <article className="g-card p-8 md:p-10 prose prose-slate prose-sm max-w-none">
            <h2>1. ข้อมูลที่เราเก็บรวบรวม</h2>
            <p>เราเก็บรวบรวมข้อมูลส่วนบุคคลที่จำเป็นสำหรับการให้บริการ ได้แก่:</p>
            <ul>
              <li><strong>ข้อมูลส่วนตัว:</strong> ชื่อ-นามสกุล, อีเมล, เบอร์โทรศัพท์</li>
              <li><strong>ข้อมูลพาสปอร์ต:</strong> หมายเลข, วันหมดอายุ (เฉพาะเมื่อจองทัวร์)</li>
              <li><strong>ข้อมูลการชำระเงิน:</strong> ผ่านระบบ Payment Gateway มาตรฐาน PCI DSS</li>
              <li><strong>ข้อมูลการใช้งาน:</strong> IP Address, Browser, การค้นหา</li>
            </ul>

            <h2>2. วัตถุประสงค์ในการใช้ข้อมูล</h2>
            <ul>
              <li>เพื่อดำเนินการจองทัวร์และจัดส่งเอกสารเดินทาง</li>
              <li>เพื่อติดต่อสื่อสารและแจ้งสถานะการจอง</li>
              <li>เพื่อปรับปรุงคุณภาพบริการและประสบการณ์ใช้งาน</li>
              <li>เพื่อปฏิบัติตามกฎหมายและข้อบังคับ</li>
            </ul>

            <h2>3. การแบ่งปันข้อมูล</h2>
            <p>เราจะแบ่งปันข้อมูลของท่านกับบุคคลที่สามเฉพาะกรณีที่จำเป็น:</p>
            <ul>
              <li>Wholesale / บริษัททัวร์ (เพื่อดำเนินการจอง)</li>
              <li>สายการบิน, โรงแรม (เพื่อจองบริการ)</li>
              <li>สถานทูต / สถานกงสุล (เพื่อดำเนินการวีซ่า)</li>
              <li>หน่วยงานรัฐ (ตามที่กฎหมายกำหนด)</li>
            </ul>

            <h2>4. การรักษาความปลอดภัย</h2>
            <p>เราใช้มาตรการรักษาความปลอดภัยทางเทคนิคและองค์กร รวมถึง SSL/TLS encryption, การเข้ารหัสข้อมูล, ระบบ Firewall และการจำกัดสิทธิ์การเข้าถึงข้อมูล</p>

            <h2>5. สิทธิ์ของเจ้าของข้อมูล</h2>
            <p>ท่านมีสิทธิ์ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) ในการ:</p>
            <ul>
              <li>เข้าถึงข้อมูลส่วนบุคคลของท่าน</li>
              <li>ขอแก้ไข ลบ หรือระงับการใช้ข้อมูล</li>
              <li>คัดค้านหรือเพิกถอนความยินยอมในการใช้ข้อมูล</li>
              <li>ขอให้ส่งหรือโอนข้อมูลไปยังผู้ควบคุมข้อมูลอื่น</li>
            </ul>

            <h2>6. การติดต่อ</h2>
            <p>หากมีคำถามเกี่ยวกับนโยบายนี้ ติดต่อเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO) ได้ที่ <a href="mailto:privacy@jongtour.com">privacy@jongtour.com</a></p>
          </article>
        </div>
      </section>
    </>
  );
}
