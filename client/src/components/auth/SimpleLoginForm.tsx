import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';

export default function SimpleLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get CSRF token first and wait for response
      const csrfResponse = await apiRequest('GET', '/api/csrf-init');
      if (!csrfResponse.ok) {
        throw new Error('Failed to initialize CSRF token');
      }
      
      // Short delay to ensure CSRF token is properly set in session
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Use our simple login endpoint
      const response = await apiRequest('POST', '/api/auth/login-simple', {
        email,
        password
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Login successful!', userData);
        
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${userData.username}!`,
          variant: 'default',
        });
        
        // Reload the page to update the auth state
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('Login failed:', error);
        
        toast({
          title: 'Login Failed',
          description: error.message || 'Please check your email and password.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      
      toast({
        title: 'Login Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4 p-4 bg-white border rounded-md">
      <h2 className="text-lg font-semibold">Simplified Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email:</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            className="border-gray-400 rounded-none bg-white focus:border-blue-500 focus:ring-0"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password:</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="border-gray-400 rounded-none bg-white focus:border-blue-500 focus:ring-0"
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </div>
  );
}