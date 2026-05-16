export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl font-black tracking-tight text-[#C9A84C]">UJRIS</div>
          <div className="text-[#7A8FA6] text-sm mt-1">Justice Intelligence Platform</div>
        </div>
        {children}
      </div>
    </div>
  );
}
