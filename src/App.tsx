// src/App.tsx
import QuoteDisplay from './components/QuoteDisplay';
import GradientBackground from './components/GradientBackground';

function App() {
  return (
    <GradientBackground>
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-full">
        <QuoteDisplay />
      </main>
    </GradientBackground>
  );
}

export default App;
