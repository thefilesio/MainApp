import withAuth from "@/hooks/use-auth";
import ImproveAgent from "@/pages/shared/ImproveAgent";

function ImproveAgentPage() {
  return <ImproveAgent />;
}

export default withAuth(ImproveAgentPage);