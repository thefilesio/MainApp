import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, signUp, user, loading } = useAuth();
  const router = useRouter();

  // Redirect if user is already logged in
  if (user) {
    router.push("/build");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await signIn(email, password).catch((error) => {
        console.error("Login failed:", error);
        toast.error("Login failed. Please check your credentials.");
      });
    } else {
      await signUp(email, password);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:text-white">
      <div className="w-full max-w-md p-4 rounded">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {isLogin ? "Sign In to Your Account" : "Create an Account"}
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setIsLogin(!isLogin)}
                disabled={loading}
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </Button>
              {isLogin && (
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-muted-foreground"
                  disabled={loading}
                >
                  Forgot your password?
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
