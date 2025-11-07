import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import api from '@/lib/api';

const loginSchema = z.object({ email: z.string().email("Invalid email address"), password: z.string().min(6, "Password must be at least 6 characters"), });

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => { /* no-op */ }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const validated = loginSchema.parse({ email, password });
      const { data } = await api.post('/auth/admin/login', validated);
      localStorage.setItem('token', data.token);
      toast.success("Logged in successfully");
      navigate("/admin/properties");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Invalid email or password");
    } finally { setIsLoggingIn(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Vishal Properties</CardTitle>
          <CardDescription className="text-center">Welcome to your property portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="login-email">Email</label>
              <Input id="login-email" type="email" placeholder="admin@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="login-password">Password</label>
              <Input id="login-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>{isLoggingIn ? "Logging in..." : "Login"}</Button>
          </form>
          <div className="mt-6 text-center"><Button variant="link" onClick={() => navigate("/")} className="text-sm">Back to Home</Button></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
