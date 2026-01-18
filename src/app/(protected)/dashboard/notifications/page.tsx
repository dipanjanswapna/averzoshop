'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { sendNotification } from '@/ai/flows/send-notification-flow';
import { useToast } from '@/hooks/use-toast';

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
                description: `${result.successCount} sent successfully. ${result.failureCount} failed.`,
            });
            form.reset();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Failed to send notifications',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-headline">Push Notifications</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Notification Composer</CardTitle>
                    <CardDescription>
                        Send a message directly to your subscribed users' devices.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Title</Label>
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
                                        <Label>Message</Label>
                                        <FormControl>
                                            <Textarea placeholder="E.g., Grab your favorite products at 50% off!" {...field} />
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
                                        <Label>Link (Optional)</Label>
                                        <FormControl>
                                            <Input placeholder="E.g., /flash-sale or https://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                <Send className="mr-2 h-4 w-4" />
                                {isLoading ? 'Sending...' : 'Send Notification'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
