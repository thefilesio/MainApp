import { useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [isResetPassword, setIsResetPassword] = useState(false);
    const { signIn, signUp, user, loading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if user is already logged in
    if (user) {
        router.push("/build");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        setIsLoading(true);
        e.preventDefault();
        if (isLogin) {
            await signIn(email, password).finally(() => {
                setIsLoading(false);
            });
        } else {
            if (!email || !password) {
                toast.error("Email and password are required.");
                return;
            }
            if (password.length < 6) {
                toast.error("Password must be at least 6 characters long.");
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                toast.error("Please enter a valid email address.");
                return;
            }
            if (password.includes(" ")) {
                toast.error("Password cannot contain spaces.");
                return;
            }
            if (password !== passwordConfirm) {
                toast.error("Passwords do not match.");
                return;
            }
            await signUp(email, password)
                .then(() => {
                    setIsLogin(true);
                    toast.success(
                        "Account created successfully! Please check your email to verify your account."
                    );
                })
                .catch((error) => {
                    console.error("Sign up failed:", error);
                    toast.error("Sign up failed. Please check your details.");
                })
                .finally(() => {
                    setEmail("");
                    setPassword("");
                    setPasswordConfirm("");
                    setIsLoading(false);
                });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background dark:text-white ">
            <div className="w-full max-w-md p-4 rounded-lg">
                <Card
                    style={{
                        borderRadius: "8px",
                    }}
                    className="bg-white dark:bg-main-dark dark:text-white shadow-lg"
                >
                    {isResetPassword ? (
                        <div>
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-center">
                                    Reset Password
                                </CardTitle>
                                <CardDescription className="text-center">
                                    Please enter your email to receive a
                                    password reset link.
                                </CardDescription>
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        setIsLoading(true);
                                        try {
                                            const { error } =
                                                await supabase.auth.resetPasswordForEmail(
                                                    email
                                                );
                                            if (error) throw error;
                                            toast.success(
                                                "Password reset link sent to your email."
                                            );
                                            setIsResetPassword(false);
                                        } catch (error: any) {
                                            toast.error(
                                                "Failed to send reset link. Please check your email."
                                            );
                                        } finally {
                                            setIsLoading(false);
                                            setEmail("");
                                        }
                                    }}
                                >
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                required
                                                disabled={isLoading}
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={isLoading}
                                        >
                                            {isLoading
                                                ? "Sending..."
                                                : "Send Reset Link"}
                                        </Button>
                                        <div className="text-center">
                                            <Button
                                                type="button"
                                                variant="link"
                                                className="w-full"
                                                onClick={() =>
                                                    setIsResetPassword(false)
                                                }
                                                disabled={isLoading}
                                            >
                                                Back to Login
                                            </Button>
                                        </div>
                                    </CardContent>
                                </form>
                            </CardHeader>
                        </div>
                    ) : (
                        <div>
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-center">
                                    {isLogin
                                        ? "Sign In to Your Account"
                                        : "Create an Account"}
                                </CardTitle>
                                <CardDescription className="text-center">
                                    {isLogin
                                        ? "Enter your email and password to access your chatbots"
                                        : "Sign up to start building AI chatbots"}
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            required
                                            disabled={isLoading}
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Password
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
                                    {!isLogin && (
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
                                                    setPasswordConfirm(
                                                        e.target.value
                                                    )
                                                }
                                                required
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-4">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={loading || isLoading}
                                    >
                                        {loading || isLoading
                                            ? "Processing..."
                                            : isLogin
                                            ? "Sign In"
                                            : "Create Account"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="w-full"
                                        onClick={() => setIsLogin(!isLogin)}
                                        disabled={loading || isLoading}
                                    >
                                        {isLogin
                                            ? "Don't have an account? Sign Up"
                                            : "Already have an account? Sign In"}
                                    </Button>
                                    {isLogin && (
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="text-sm text-muted-foreground"
                                            disabled={loading || isLoading}
                                            onClick={() =>
                                                setIsResetPassword(true)
                                            }
                                        >
                                            Forgot your password?
                                        </Button>
                                    )}
                                </CardFooter>
                            </form>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Auth;
