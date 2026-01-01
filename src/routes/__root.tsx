import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useTheme } from "@/hooks/use-theme";
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
	component: Root,
});

function Root() {
	// Initialize theme on mount
	useTheme();

	return (
		<div className="flex flex-col min-h-screen">
			<ErrorBoundary tagName="main" className="flex-1">
				<Outlet />
			</ErrorBoundary>
		</div>
	);
}
