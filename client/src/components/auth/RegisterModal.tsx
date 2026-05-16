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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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

const registerFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
  confirmPassword: z.string(),
  securityQuestion: z.string().min(1, { message: "Please select a security question" }),
  securityAnswer: z.string().min(1, { message: "Security answer is required" }),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

const securityQuestions = [
  { value: "first-pet", label: "What was the name of your first pet?" },
  { value: "birth-city", label: "In what city were you born?" },
  { value: "mother-maiden", label: "What is your mother's maiden name?" },
  { value: "elementary-school", label: "What elementary school did you attend?" },
];

export default function RegisterModal() {
  const { login } = useAuth();
  const { isRegisterModalOpen, closeRegisterModal, openLoginModal } = useModal();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      securityQuestion: "",
      securityAnswer: "",
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // First, get a CSRF token
      const tokenResponse = await fetch('/api/csrf-init', { 
        method: 'GET', 
        credentials: 'include' 
      });
      
      // Extract the CSRF token from the response headers
      const csrfToken = tokenResponse.headers.get('X-CSRF-Token');
      
      if (!csrfToken) {
        throw new Error("Could not obtain CSRF token. Please refresh the page and try again.");
      }
      
      // Perform registration with the CSRF token
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        credentials: "include",
        body: JSON.stringify({
          username: data.email.split('@')[0], // Generate username from email
          email: data.email,
          password: data.password,
          securityQuestion: data.securityQuestion,
          securityAnswer: data.securityAnswer,
        })
      });
      
      if (!response.ok) {
        // Handle non-2xx responses
        const errorText = await response.text();
        throw new Error(errorText || `Error: ${response.status} ${response.statusText}`);
      }
      
      // Parse the response
      const userData = await response.json();
      
      if (userData && userData.id) {
        // Successful registration with valid user data
        login(userData);
        closeRegisterModal();
        
        toast({
          title: "Registration successful",
          description: "Welcome to ConnectList!",
        });
      } else {
        throw new Error("Invalid user data received from server");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchToLogin = () => {
    closeRegisterModal();
    openLoginModal();
  };

  return (
    <Dialog open={isRegisterModalOpen} onOpenChange={closeRegisterModal}>
      <DialogContent className="sm:max-w-md bg-gray-100 border border-gray-400 rounded-none p-4">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-base font-medium">create account on connectlist</DialogTitle>
            <button
              className="text-blue-700 text-sm hover:underline"
              onClick={closeRegisterModal}
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
                  <FormDescription className="text-xs text-gray-500">
                    minimum 8 characters, include numbers and special characters
                  </FormDescription>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">confirm password:</FormLabel>
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

            <FormField
              control={form.control}
              name="terms"
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
                      i agree to the{" "}
                      <button type="button" className="text-blue-700 text-xs hover:underline">
                        terms of service
                      </button>{" "}
                      and{" "}
                      <button type="button" className="text-blue-700 text-xs hover:underline">
                        privacy policy
                      </button>
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <button 
              type="submit" 
              className="bg-gray-200 border border-gray-400 text-black px-3 py-1 text-sm hover:bg-gray-300 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "creating account..." : "register"}
            </button>
          </form>
        </Form>
        
        <div className="mt-4">
          <p className="text-xs text-gray-600">
            already have an account?{" "}
            <button 
              type="button"
              className="text-blue-700 text-xs hover:underline" 
              onClick={switchToLogin}
            >
              log in
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
