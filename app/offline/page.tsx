export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">📴</div>
        <h1 className="text-2xl font-bold text-[#EEF2F7] mb-3">You're offline</h1>
        <p className="text-[#7A8FA6] mb-6">
          UJRIS requires an internet connection for AI features and document uploads. Your existing case data is still accessible.
        </p>
        <button onClick={() => window.location.reload()}
          className="btn-primary">Try again</button>
      </div>
    </div>
  );
}
