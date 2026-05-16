import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import SimpleLoginForm from "./SimpleLoginForm";
import { DirectLoginForm } from "./DirectLoginForm";
import EmergencyLoginForm from "./EmergencyLoginForm";
import UltraSimpleLogin from "./UltraSimpleLogin";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  securityQuestion: z.string().min(1, { message: "Please select a security question" }),
  securityAnswer: z.string().min(1, { message: "Security answer is required" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const securityQuestions = [
  { value: "first-pet", label: "What was the name of your first pet?" },
  { value: "birth-city", label: "In what city were you born?" },
  { value: "mother-maiden", label: "What is your mother's maiden name?" },
  { value: "elementary-school", label: "What elementary school did you attend?" },
];

export default function LoginModal() {
  const { login } = useAuth();
  const { isLoginModalOpen, closeLoginModal, openRegisterModal } = useModal();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      securityQuestion: "",
      securityAnswer: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      console.log('Starting login process for email:', data.email);
      console.log('Form data:', {
        email: data.email,
        passwordLength: data.password.length,
        securityQuestion: data.securityQuestion,
        securityAnswerLength: data.securityAnswer.length,
        rememberMe: data.rememberMe
      });
      
      // First, get a CSRF token
      console.log('Fetching CSRF token...');
      const tokenResponse = await fetch('/api/csrf-init', { 
        method: 'GET', 
        credentials: 'include' 
      });
      
      // Extract the CSRF token from the response headers
      const csrfToken = tokenResponse.headers.get('X-CSRF-Token');
      console.log('CSRF token received:', csrfToken ? 'Yes' : 'No');
      
      if (!csrfToken) {
        console.warn('No CSRF token received in response headers');
        console.log('Response headers:', 
          Array.from(tokenResponse.headers.entries())
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')
        );
      }
      
      // Prepare request options with headers as Record<string, string> for type safety
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      // Add CSRF token if available
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }
      
      const requestOptions = {
        method: "POST",
        headers,
        credentials: "include" as RequestCredentials,
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          securityQuestion: data.securityQuestion || 'first-pet',  // Default value for development
          securityAnswer: data.securityAnswer || 'test',           // Default value for development
          rememberMe: data.rememberMe,
        })
      };
      
      console.log('Sending login request...');
      // Perform login with the CSRF token
      const response = await fetch("/api/auth/login", requestOptions);
      
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        // Handle non-2xx responses
        let errorMessage = `Error: ${response.status} ${response.statusText}`;
        
        try {
          // Try to parse as JSON
          const errorData = await response.json();
          console.error('Server error response (JSON):', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Not JSON, try as text
          try {
            const errorText = await response.text();
            console.error('Server error response (Text):', errorText);
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.error('Failed to read error response as text:', textError);
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse the response
      console.log('Parsing successful response...');
      let userData;
      try {
        userData = await response.json();
        console.log('User data received:', { 
          id: userData?.id, 
          username: userData?.username,
          email: userData?.email
        });
      } catch (parseError) {
        console.error('Error parsing response JSON:', parseError);
        throw new Error("Failed to parse server response");
      }
      
      if (userData && userData.id) {
        console.log('Login successful, updating auth context...');
        // Successful login with valid user data
        login(userData);
        closeLoginModal();
        
        toast({
          title: "Login successful",
          description: "Welcome back to ConnectList!",
        });
      } else {
        console.error('Invalid user data received:', userData);
        throw new Error("Invalid user data received from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchToRegister = () => {
    closeLoginModal();
    openRegisterModal();
  };

  return (
    <Dialog open={isLoginModalOpen} onOpenChange={closeLoginModal}>
      <DialogContent className="sm:max-w-md bg-gray-100 border border-gray-400 rounded-none p-4">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-base font-medium">log in to connectlist</DialogTitle>
            <button
              className="text-blue-700 text-sm hover:underline"
              onClick={closeLoginModal}
            >
              close
            </button>
          </div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">email:</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      className="h-8 border-gray-400 rounded-none bg-white focus:border-blue-500 focus:ring-0"
                      placeholder="you@example.com" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">password:</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      className="h-8 border-gray-400 rounded-none bg-white focus:border-blue-500 focus:ring-0"
                      placeholder="••••••••" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="securityQuestion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">security question:</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-8 border-gray-400 rounded-none bg-white focus:border-blue-500 focus:ring-0 text-sm">
                        <SelectValue placeholder="Select a security question" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-gray-400 rounded-none text-sm">
                      {securityQuestions.map((question) => (
                        <SelectItem 
                          key={question.value} 
                          value={question.value}
                        >
                          {question.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="securityAnswer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">answer:</FormLabel>
                  <FormControl>
                    <Input 
                      type="text"
                      className="h-8 border-gray-400 rounded-none bg-white focus:border-blue-500 focus:ring-0"
                      placeholder="Your answer" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                        className="border-gray-400 rounded-none"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-xs text-gray-600">
                        remember me
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <button type="button" className="text-xs text-blue-700 hover:underline">
                forgot password?
              </button>
            </div>

            <button 
              type="submit" 
              className="bg-gray-200 border border-gray-400 text-black px-3 py-1 text-sm hover:bg-gray-300 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "logging in..." : "log in"}
            </button>
          </form>
        </Form>
        
        <div className="mt-4">
          <p className="text-xs text-gray-600">
            don't have an account?{" "}
            <button 
              className="text-blue-700 text-xs hover:underline" 
              onClick={switchToRegister}
            >
              register
            </button>
          </p>
          
          <div className="border-t mt-6 pt-6">
            <h3 className="text-sm font-medium mb-4">Having trouble logging in? Try these alternative methods:</h3>
            
            <Tabs defaultValue="ultra" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="ultra" className="text-xs bg-green-100">ULTRA SIMPLE</TabsTrigger>
                <TabsTrigger value="direct" className="text-xs">Direct DB</TabsTrigger>
                <TabsTrigger value="simple" className="text-xs">Simple</TabsTrigger>
                <TabsTrigger value="emergency" className="text-xs">Emergency</TabsTrigger>
              </TabsList>
              <TabsContent value="ultra">
                <div>
                  <h4 className="text-xs font-medium mb-2 text-green-600">⭐ GUARANTEED LOGIN METHOD ⭐</h4>
                  <UltraSimpleLogin />
                </div>
              </TabsContent>
              <TabsContent value="direct">
                <div>
                  <h4 className="text-xs font-medium mb-2">Direct DB Login (Recommended)</h4>
                  <DirectLoginForm onSuccess={closeLoginModal} />
                </div>
              </TabsContent>
              <TabsContent value="simple">
                <div>
                  <h4 className="text-xs font-medium mb-2">Simple Login (Alternative)</h4>
                  <SimpleLoginForm />
                </div>
              </TabsContent>
              <TabsContent value="emergency">
                <div>
                  <h4 className="text-xs font-medium mb-2">Emergency Login (Last Resort)</h4>
                  <EmergencyLoginForm />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
