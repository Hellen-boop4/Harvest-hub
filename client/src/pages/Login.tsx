import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Milk, Loader, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import backgroundImage from "@assets/generated_images/Cows_grazing_in_green_meadow_a0ef8938.png";

export default function Login() {
  const { toast } = useToast();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<"username" | "password" | null>(null);

  const validateForm = () => {
    let isValid = true;
    setUsernameError("");
    setPasswordError("");

    if (!username.trim()) {
      setUsernameError("Username is required");
      isValid = false;
    }
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    const result = await login(username, password);
    if (result.success) {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${username}!`,
      });
    } else {
      toast({
        title: "Login Failed",
        description: result.error || "Invalid credentials",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-fade-in"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="w-full max-w-md p-6 relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 shadow-lg animate-bounce-subtle hover:animate-pulse-glow transition-all">
            <Milk className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg animate-slide-down" style={{ animationDelay: '100ms' }}>
            Harvest Hub
          </h1>
          <p className="text-white/90 drop-shadow-md animate-slide-down" style={{ animationDelay: '200ms' }}>
            Agricultural Management System
          </p>
        </div>

        <Card className="shadow-2xl backdrop-blur-sm bg-card/95 border-0 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  data-testid="label-username"
                  className={`transition-colors ${usernameError ? "text-red-600" : focusedField === "username" ? "text-primary" : ""}`}
                >
                  Username
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setUsernameError("");
                    }}
                    onFocus={() => setFocusedField("username")}
                    onBlur={() => setFocusedField(null)}
                    required
                    data-testid="input-username"
                    className={`transition-all pr-10 ${usernameError ? "border-red-500 focus:ring-red-200" : focusedField === "username" ? "border-primary" : ""}`}
                    disabled={isLoading}
                  />
                  {username && !usernameError && focusedField !== "username" && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600 animate-bounce-subtle" />
                  )}
                  {usernameError && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-600" />
                  )}
                </div>
                {usernameError && (
                  <p className="text-sm text-red-600 animate-slide-up">{usernameError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  data-testid="label-password"
                  className={`transition-colors ${passwordError ? "text-red-600" : focusedField === "password" ? "text-primary" : ""}`}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError("");
                    }}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    required
                    data-testid="input-password"
                    className={`transition-all pr-10 ${passwordError ? "border-red-500 focus:ring-red-200" : focusedField === "password" ? "border-primary" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-600 animate-slide-up">{passwordError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full btn-interactive transition-all duration-300"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
                Demo: Use any username with password <code className="bg-background px-2 py-1 rounded font-mono">admin</code>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-white/80 drop-shadow-md mt-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          Secure access to your agricultural management platform
        </p>
      </div>
    </div>
  );
}
