export function PrivacyView({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={onBack} className="underline mb-4">
        ← Back
      </button>
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p>Your privacy policy text goes here.</p>
    </div>
  );
}
