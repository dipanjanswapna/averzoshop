'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { sendNotification } from '@/ai/flows/send-notification-flow';
import { useToast } from '@/hooks/use-toast';

// 1. Form validation schema
const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required.' }),
  message: z.string().min(1, { message: 'Message is required.' }),
  link: z.string().optional(),
});

export default function NotificationsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      message: '',
      link: '',
    },
  });

  // 2. Submit function
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const result = await sendNotification({
        title: values.title,
        body: values.message,
        link: values.link || undefined,
      });

      toast({
        title: 'Notifications Sent!',
        description: `Successfully sent to ${result.successCount} users. Failed for ${result.failureCount}.`,
      });
      
      form.reset(); // Reset form on success
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to send notifications',
        description: error.message || 'Something went wrong while parsing the request.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold font-headline">Push Notifications</h1>
      
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle>Notification Composer</CardTitle>
          <CardDescription>
            Send a message directly to your subscribed users' devices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-sm font-semibold">Title</Label>
                    <FormControl>
                      <Input placeholder="E.g., Flash Sale is LIVE!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-sm font-semibold">Message</Label>
                    <FormControl>
                      <Textarea 
                        placeholder="E.g., Grab your favorite products at 50% off!" 
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-sm font-semibold">Link (Optional)</Label>
                    <FormControl>
                      <Input 
                        placeholder="E.g., /flash-sale or https://yourstore.com/promo" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Notification
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
