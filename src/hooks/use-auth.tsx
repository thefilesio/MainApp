import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function withAuth<P extends React.PropsWithChildren<unknown>>(
    Component: React.ComponentType<P>
) {
    return function AuthComponent(props: P) {
        const { user, loading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!loading && !user) {
                router.replace("/auth");
            }
        }, [loading, user]);

        if (loading || !user) {
            return (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black opacity-10 cursor-progress">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#2AB6A6]"></div>{" "}
                </div>
            );
        }

        return <Component {...props} />;
    };
}
export default withAuth;
