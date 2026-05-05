import React from "react";

export const metadata = {
  title: "นโยบายคุกกี้ (Cookie Policy)",
  description: "นโยบายการใช้งานคุกกี้ของ Jongtour",
};

export default function CookiePolicyPage() {
  return (
    <div className="bg-white">
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="g-container py-12">
          <h1 className="text-3xl font-bold text-slate-900">นโยบายคุกกี้ (Cookie Policy)</h1>
          <p className="text-slate-500 mt-2">อัพเดทล่าสุด: มกราคม 2026</p>
        </div>
      </section>

      <article className="g-container-narrow py-12 prose prose-slate max-w-none">
        <h2>1. คุกกี้คืออะไร</h2>
        <p>คุกกี้คือไฟล์ข้อมูลขนาดเล็กที่ถูกจัดเก็บในเบราว์เซอร์ของท่านเมื่อเข้าเยี่ยมชมเว็บไซต์ เพื่อช่วยให้เว็บไซต์จดจำข้อมูลเกี่ยวกับการเข้าใช้งานของท่าน</p>

        <h2>2. ประเภทคุกกี้ที่เราใช้</h2>
        <h3>คุกกี้ที่จำเป็น (Strictly Necessary)</h3>
        <p>คุกกี้ที่จำเป็นต่อการทำงานของเว็บไซต์ เช่น การเข้าสู่ระบบ ตะกร้าสินค้า และการชำระเงิน</p>

        <h3>คุกกี้วิเคราะห์ (Analytics)</h3>
        <p>คุกกี้ที่ช่วยให้เราเข้าใจพฤติกรรมการใช้งานเว็บไซต์ เพื่อปรับปรุงประสบการณ์การใช้งาน</p>

        <h3>คุกกี้การตลาด (Marketing)</h3>
        <p>คุกกี้ที่ใช้ในการแสดงโฆษณาที่เกี่ยวข้องกับท่าน</p>

        <h2>3. การจัดการคุกกี้</h2>
        <p>ท่านสามารถจัดการการตั้งค่าคุกกี้ได้จากเบราว์เซอร์ของท่าน โดยสามารถเลือกบล็อกหรือลบคุกกี้ได้ อย่างไรก็ตาม การปิดใช้งานคุกกี้บางประเภทอาจส่งผลต่อการทำงานของเว็บไซต์</p>

        <h2>4. ติดต่อเรา</h2>
        <p>หากมีข้อสงสัยเกี่ยวกับนโยบายคุกกี้ กรุณาติดต่อ: privacy@jongtour.com</p>
      </article>
    </div>
  );
}
