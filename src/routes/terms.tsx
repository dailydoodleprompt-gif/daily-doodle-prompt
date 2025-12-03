import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "./__root";

function TermsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Terms & Conditions</h1>
      <p>Your terms and conditions text goes here.</p>
    </div>
  );
}

export const TermsRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "terms",
  component: TermsPage,
});
