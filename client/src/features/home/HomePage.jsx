export function HomePage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
          Welcome
        </h1>
        <p className="text-slate-400 text-lg">
          Your 3D configurator.
        </p>
      </div>
    </div>
  );
}
