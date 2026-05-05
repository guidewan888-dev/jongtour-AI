export default function ComingSoon({ title = "Coming Soon" }: { title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-orange-100 text-orange-600 p-4 rounded-full mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20"></path>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">{title}</h1>
      <p className="text-slate-500 max-w-md mx-auto mb-8">
        We are currently building this feature with our clean architecture. 
        It will be available soon with 100% real data.
      </p>
      <a 
        href="/" 
        className="px-6 py-3 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 transition-colors"
      >
        Return to Home
      </a>
    </div>
  );
}
