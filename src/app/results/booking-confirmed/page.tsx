export default async function BookingConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {

  const resolvedSearchParams = await searchParams;
  const slug = resolvedSearchParams?.slug;

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">

        <p className="uppercase tracking-[0.4em] text-zinc-600 text-xs mb-8">
          Private Reservation
        </p>

        <h1 className="text-4xl md:text-7xl font-light leading-[0.95] tracking-[-0.04em] mb-10">
          Your booking request is confirmed
        </h1>

        <p className="text-zinc-400 text-lg leading-[1.9] mb-12">
          Thank you for confirming your email address. Our team has been
          notified and will reach out to you shortly to finalize the details
          of your private Riviera experience.
        </p>

        {slug && (
          <a
            href={`/results/proposal-staging/${slug}`}
            className="inline-block bg-white text-black px-10 py-5 rounded-full uppercase tracking-[0.25em] text-xs hover:scale-105 transition-all duration-500 mb-12"
          >
            View Your Proposal
          </a>
        )}

        <p className="text-zinc-600 text-sm">
          If you have any questions in the meantime, feel free to contact us
          directly at{" "}
          <a href="mailto:info@portovenere.com" className="underline hover:text-white">
            info@portovenere.com
          </a>
          .
        </p>

      </div>
    </main>
  );
}