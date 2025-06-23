import withAuth from "@/hooks/use-auth";
import BuildAgent from "@/pages/shared/BuildAgent";

function BuildAgentPage() {
  return <BuildAgent />;
}

export default withAuth(BuildAgentPage);
