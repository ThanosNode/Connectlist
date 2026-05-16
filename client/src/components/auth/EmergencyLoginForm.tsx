import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { AxiosError } from 'axios';
import axios from 'axios';

export default function EmergencyLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Attempting emergency login with email:', email);
      
      // Use the emergency-login endpoint that bypasses CSRF and middleware
      const response = await axios.post('/api/emergency-login', {
        email,
        password
      });
      
      if (response.data.success && response.data.user) {
        // Use the login method from AuthContext to set the user
        login(response.data.user);
        
        toast({
          title: "Emergency login successful",
          description: "You've been logged in through the emergency pathway",
        });
        
        // Clear form fields
        setEmail('');
        setPassword('');
        
        // The modal will be closed by the parent component when it detects login
      } else {
        toast({
          title: "Login failed",
          description: response.data.message || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Emergency login error:', error);
      
      let errorMessage = "An error occurred during login";
      
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Emergency login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="text-lg font-medium">Emergency Login</h3>
        <p className="text-sm text-muted-foreground">
          Use this form if normal login is not working.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? <span className="inline-block animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" /> : null}
          Emergency Login
        </Button>
      </form>
      
      <div className="text-sm text-muted-foreground">
        <p className="text-xs text-amber-600 font-medium">
          This is a special login that bypasses security checks. Use only when the normal login fails.
        </p>
      </div>
    </div>
  );
}