// src/App.tsx
import QuoteDisplay from './components/QuoteDisplay';
import GradientBackground from './components/GradientBackground';

function App() {
  return (
    <GradientBackground>
      {/*
        Main Container
        Mobile: Less padding to allow full width cards.
        Desktop: More breathing room.
      */}
      <main
        className="flex flex-col items-center justify-center min-h-screen w-full mx-auto px-4 sm:px-6 lg:px-8 py-safe"
      >
        <QuoteDisplay />
      </main>
    </GradientBackground>
  );
}

export default App;
