export function TermsView({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={onBack} className="underline mb-4">
        ← Back
      </button>
      <h1 className="text-3xl font-bold mb-4">Terms & Conditions</h1>
      <p>Your terms and conditions text goes here.</p>
    </div>
  );
}

