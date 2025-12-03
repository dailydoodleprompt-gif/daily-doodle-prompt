import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "./__root";

function PrivacyPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p>Your privacy policy text goes here.</p>
    </div>
  );
}

export const PrivacyRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "privacy",
  component: PrivacyPage,
});
