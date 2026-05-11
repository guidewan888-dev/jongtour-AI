'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <h2 className="text-lg font-bold text-red-800">Dashboard เกิดข้อผิดพลาด</h2>
      <p className="mt-2 text-sm text-red-700">
        ระบบเจอข้อมูลบางส่วนผิดรูปแบบ กรุณาลองโหลดใหม่อีกครั้ง
      </p>
      {error?.digest ? (
        <p className="mt-2 text-xs text-red-600">Error digest: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
      >
        โหลดใหม่
      </button>
    </div>
  );
}
