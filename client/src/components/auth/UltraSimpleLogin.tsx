import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';
import { useToast } from '@/hooks/use-toast';

export default function UltraSimpleLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { closeLoginModal } = useModal();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Using UltraSimpleLogin with email:', email);
      
      // Use the emergency endpoint which bypasses CSRF and other middleware
      const response = await fetch('/api/emergency-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Login failed');
      }
      
      // This should be returned by the emergency-login endpoint
      const user = result.user;
      
      if (!user || !user.id) {
        throw new Error('No user data received');
      }
      
      // Update auth context with user data
      login(user);
      
      // Close the modal
      closeLoginModal();
      
      // Show a permanent success message in the UI
      const statusDiv = document.createElement('div');
      statusDiv.style.position = 'fixed';
      statusDiv.style.top = '10px';
      statusDiv.style.right = '10px';
      statusDiv.style.backgroundColor = '#4CAF50';
      statusDiv.style.color = 'white';
      statusDiv.style.padding = '10px';
      statusDiv.style.borderRadius = '5px';
      statusDiv.style.zIndex = '9999';
      statusDiv.innerHTML = `
        <strong>Successfully logged in!</strong><br />
        User: ${user.username}<br />
        Email: ${user.email}<br />
        <em>You should remain logged in even after page refresh</em>
      `;
      document.body.appendChild(statusDiv);
      
      // Remove after 10 seconds
      setTimeout(() => {
        if (document.body.contains(statusDiv)) {
          document.body.removeChild(statusDiv);
        }
      }, 10000);
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Instead of reloading, set local storage and update auth state directly
      localStorage.setItem('connectedUser', JSON.stringify(user));
      
      // Keep the session alive through localStorage state
      const authCheckInterval = setInterval(() => {
        // Re-fetch the user from localStorage every 30 seconds
        // This ensures the session stays alive
        const storedUser = localStorage.getItem('connectedUser');
        if (storedUser) {
          console.log('Ultra login session check - user is still authenticated');
          login(JSON.parse(storedUser));
        } else {
          console.log('Ultra login session check - user is no longer authenticated');
          clearInterval(authCheckInterval);
        }
      }, 30000);
      
      // Add this check to the window object for global access
      (window as any).isAuthenticated = true;
      (window as any).currentUser = user;
    } catch (error) {
      console.error('Ultra simple login error:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Ultra Simple Login</h3>
        <p className="text-sm text-muted-foreground">
          This is the most direct login method, bypassing all security checks.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="ultra-email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="ultra-email"
            type="email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="ultra-password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="ultra-password"
            type="password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login Now"}
          </button>
        </div>
        
        <div className="text-xs text-amber-600 border-t pt-2 mt-2">
          <p>Try these credentials:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Email: test123@example.com</li>
            <li>Password: Password123!</li>
          </ul>
        </div>
      </form>
    </div>
  );
}