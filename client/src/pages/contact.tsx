import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "name must be at least 2 characters" }),
  email: z.string().email({ message: "please enter a valid email address" }),
  subject: z.string().min(3, { message: "subject must be at least 3 characters" }),
  message: z.string().min(10, { message: "message must be at least 10 characters" })
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message sent",
        description: "Thank you for contacting us. We'll respond to your inquiry soon.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Helmet>
        <title>Contact Us | ConnectList</title>
        <meta 
          name="description" 
          content="Get in touch with ConnectList. We're here to help with any questions or concerns about our Web3-focused classified platform."
        />
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-4">contact us</h1>
        <p className="mb-4 text-sm leading-relaxed">
          have questions or feedback? we'd love to hear from you. fill out the form below or email us directly.
        </p>
      </div>
      
      <div className="mb-8">
        <p className="text-sm italic text-gray-600 mb-4">
          Thank you for your message. Due to a large number of user inquiries, please allow for up to a couple of business days for a response. We appreciate your understanding and will address your request as soon as we can.
        </p>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">email</h2>
          <p className="text-sm leading-relaxed">
            <a href="mailto:devservicerelay@gmail.com" className="text-blue-700 hover:underline">devservicerelay@gmail.com</a>
          </p>
        </div>
      </div>
      
      <div className="bg-gray-100 p-6 border border-gray-300">
        <h2 className="text-lg font-medium mb-4">send us a message</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">name:</FormLabel>
                  <FormControl>
                    <Input 
                      className="h-8 border-gray-400 rounded-none bg-white focus:border-blue-500 focus:ring-0"
                      placeholder="your name" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">email:</FormLabel>
                  <FormControl>
                    <Input 
                      className="h-8 border-gray-400 rounded-none bg-white focus:border-blue-500 focus:ring-0"
                      placeholder="your email address" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">subject:</FormLabel>
                  <FormControl>
                    <Input 
                      className="h-8 border-gray-400 rounded-none bg-white focus:border-blue-500 focus:ring-0"
                      placeholder="message subject" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-normal">message:</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="min-h-[120px] border-gray-400 rounded-none bg-white focus:border-blue-500 focus:ring-0"
                      placeholder="type your message here..." 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />
            
            <button 
              type="submit" 
              className="bg-gray-200 border border-gray-400 text-black px-3 py-1 text-sm hover:bg-gray-300 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "sending..." : "send message"}
            </button>
          </form>
        </Form>
      </div>
    </div>
  );
}