import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Leaf } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const setDemoCredentials = (role: "collector" | "processor" | "admin") => {
    const credentials: Record<string, { email: string; password: string }> = {
      collector: { email: "collector@example.com", password: "password" },
      processor: { email: "processor@example.com", password: "password" },
      admin: { email: "admin@example.com", password: "password" },
    };
    const creds = credentials[role];
    setEmail(creds.email);
    setPassword(creds.password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success("Login successful!");
      setLocation("/collector");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-green-900">
              Herb-Tracechain
            </h1>
          </div>
          <p className="text-gray-600">
            Blockchain-powered herb supply chain tracking
          </p>
        </div>

        <Card className="p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white border-gray-200"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 h-10"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3 font-semibold">
              Demo Credentials:
            </p>
            <div className="space-y-2">
              <Button
                type="button"
                onClick={() => setDemoCredentials("collector")}
                variant="outline"
                className="w-full justify-start text-left text-xs"
                disabled={isLoading}
              >
                <span className="font-mono">Collector</span>
              </Button>
              <Button
                type="button"
                onClick={() => setDemoCredentials("processor")}
                variant="outline"
                className="w-full justify-start text-left text-xs"
                disabled={isLoading}
              >
                <span className="font-mono">Processor</span>
              </Button>
              <Button
                type="button"
                onClick={() => setDemoCredentials("admin")}
                variant="outline"
                className="w-full justify-start text-left text-xs"
                disabled={isLoading}
              >
                <span className="font-mono">Admin</span>
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Password: <span className="font-mono">password</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
