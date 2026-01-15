// src/App.tsx
import QuoteDisplay from './components/QuoteDisplay';
import GradientBackground from './components/GradientBackground';

function App() {
  return (
    <GradientBackground>
      {/*
        Main Container
        Simplifying layout to allow QuoteDisplay to handle its own full-viewport logic.
      */}
      <main className="w-full h-full">
        <QuoteDisplay />
      </main>
    </GradientBackground>
  );
}

export default App;
