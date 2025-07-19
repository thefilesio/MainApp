import withAuth from "@/hooks/use-auth";
import DemoPage from "./shared/DemoPage";

 function DemoAgentPage() {
  return <DemoPage />;
}

export default withAuth(DemoAgentPage);