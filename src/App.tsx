// src/App.tsx
import QuoteDisplay from './components/QuoteDisplay';
import GradientBackground from './components/GradientBackground';

function App() {
  return (
    <GradientBackground>
      {/* "Content Area" centered with max-width 800px */}
      <main
        className="flex flex-col items-center justify-center min-h-screen w-full max-w-[800px] mx-auto p-5 sm:p-10" // mobile p-5 (20px), desktop p-10 (40px)
      >
        <QuoteDisplay />
      </main>
    </GradientBackground>
  );
}

export default App;
