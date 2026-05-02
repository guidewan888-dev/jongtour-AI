"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Building, User, Mail, Lock, Phone } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
      }

      alert("ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ");
      router.push("/auth/login");
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">สมัครเป็น Agent</h2>
        <p className="mt-2 text-sm text-gray-600">
          ลงทะเบียนเพื่อเริ่มต้นใช้งานระบบ B2B
        </p>
      </div>

      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
        <form className="space-y-4" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">ชื่อบริษัท / เอเจนซี่</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="companyName"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                className="pl-10 block w-full sm:text-sm border-gray-300 rounded-md py-2 border focus:ring-orange-500 focus:border-orange-500"
                placeholder="บริษัท ทัวร์ดี จำกัด"
              />
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">ชื่อผู้ติดต่อหลัก</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="pl-10 block w-full sm:text-sm border-gray-300 rounded-md py-2 border focus:ring-orange-500 focus:border-orange-500"
                placeholder="สมชาย ใจดี"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">อีเมล (สำหรับเข้าระบบ)</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="pl-10 block w-full sm:text-sm border-gray-300 rounded-md py-2 border focus:ring-orange-500 focus:border-orange-500"
                placeholder="agent@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="pl-10 block w-full sm:text-sm border-gray-300 rounded-md py-2 border focus:ring-orange-500 focus:border-orange-500"
                placeholder="0812345678"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="pl-10 block w-full sm:text-sm border-gray-300 rounded-md py-2 border focus:ring-orange-500 focus:border-orange-500"
                placeholder="อย่างน้อย 6 ตัวอักษร"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10 block w-full sm:text-sm border-gray-300 rounded-md py-2 border focus:ring-orange-500 focus:border-orange-500"
                placeholder="พิมพ์รหัสผ่านอีกครั้ง"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-400 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังลงทะเบียน...
                </>
              ) : (
                "สมัครบัญชี Agent"
              )}
            </button>
          </div>
          
          <div className="text-center mt-4 text-sm">
            <span className="text-gray-600">มีบัญชีอยู่แล้ว? </span>
            <Link href="/auth/login" className="font-medium text-orange-600 hover:text-orange-500">
              เข้าสู่ระบบที่นี่
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
