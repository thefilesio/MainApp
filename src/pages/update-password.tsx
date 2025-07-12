import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [isSessionReady, setIsSessionReady] = useState(false);

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY") {
                setIsSessionReady(true);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !passwordConfirm) {
            toast.error("Password and Password Confirmation are required.");
            return;
        }
        if (password.length < 6) {
            toast.error("Password has to be at least 6 characters long.");
            return;
        }
        if (password !== passwordConfirm) {
            toast.error("Password dan Password Confirmation is not match.");
            return;
        }

        setIsLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            setIsLoading(false);
            toast.error(`Failed to update password: ${error.message}`);
        } else {
            toast.success("Password updated successfully!");
            setTimeout(() => {
                // log out the user after password update
                supabase.auth.signOut().then(() => {
                    setIsLoading(false);

                    router.push("/auth");
                });
            }, 2000);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background dark:text-white ">
            <div className="w-full max-w-md p-4 rounded-lg">
                <Card
                    style={{ borderRadius: "8px" }}
                    className="bg-white dark:bg-main-dark dark:text-white shadow-lg"
                >
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">
                            Reset Password
                        </CardTitle>
                        <CardDescription className="text-center">
                            Please enter your new password below.
                        </CardDescription>
                    </CardHeader>

                    {isSessionReady ? (
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        New Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        disabled={isLoading}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        disabled={isLoading}
                                        value={passwordConfirm}
                                        onChange={(e) =>
                                            setPasswordConfirm(e.target.value)
                                        }
                                        required
                                        placeholder="••••••••"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading
                                        ? "Updating..."
                                        : "Update Password"}
                                </Button>
                            </CardFooter>
                        </form>
                    ) : (
                        <CardContent>
                            <p className="text-center">
                                Please wait while we prepare your session...
                            </p>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}
