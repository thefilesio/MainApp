// pages/launchagent.tsx
import withAuth from "@/hooks/use-auth";
import LaunchAgent from "@/pages/shared/LaunchAgent";

function LaunchAgentPage() {
  return <LaunchAgent />;
}

export default withAuth(LaunchAgentPage);
