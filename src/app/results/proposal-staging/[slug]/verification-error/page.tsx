export default function VerificationErrorPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <p className="uppercase tracking-[0.4em] text-zinc-600 text-xs mb-8">
          Verification Link
        </p>
        <h1 className="text-4xl md:text-6xl font-light leading-[0.95] mb-8">
          This link is invalid or has expired.
        </h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          Please contact us directly and we'll be happy to confirm your
          booking request manually.
        </p>
      </div>
    </main>
  );
}