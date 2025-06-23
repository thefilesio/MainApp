import withAuth from "@/hooks/use-auth";
import DemoAgent from "@/pages/shared/DemoAgent";

 function DemoAgentPage() {
  return <DemoAgent />;
}

export default withAuth(DemoAgentPage);