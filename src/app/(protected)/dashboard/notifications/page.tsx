
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Users, User, Search, XCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sendNotification } from '@/ai/flows/send-notification-flow';
import { sendNotificationToRole, SendNotificationToRoleInput } from '@/ai/flows/send-notification-to-role';
import { sendTargetedNotification, SendTargetedNotificationInput } from '@/ai/flows/send-targeted-notification';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { UserData } from '@/types/user';

// Schema for "To All"
const toAllSchema = z.object({
  title: z.string().min(1, { message: 'Title is required.' }),
  message: z.string().min(1, { message: 'Message is required.' }),
  link: z.string().optional(),
});

// Schema for "To Role"
const toRoleSchema = z.object({
  role: z.enum(['customer', 'vendor', 'rider', 'admin', 'outlet']),
  title: z.string().min(1, { message: 'Title is required.' }),
  message: z.string().min(1, { message: 'Message is required.' }),
  link: z.string().optional(),
});

// Schema for "To User"
const toUserSchema = z.object({
  userId: z.string().min(1, { message: "A user must be selected." }),
  title: z.string().min(1, { message: 'Title is required.' }),
  message: z.string().min(1, { message: 'Message is required.' }),
  link: z.string().optional(),
});


// Notification Form Component
const NotificationForm = ({ schema, onSubmit, children, buttonText }: { schema: any, onSubmit: (values: any) => Promise<void>, children: React.ReactNode, buttonText: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: schema.strip()._def.shape(),
  });

  const handleFormSubmit = async (values: any) => {
    setIsLoading(true);
    await onSubmit(values);
    setIsLoading(false);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {children(form)}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <Label className="text-sm font-semibold">Title</Label>
              <FormControl><Input placeholder="E.g., Flash Sale is LIVE!" {...field} /></FormControl>
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
              <FormControl><Textarea placeholder="E.g., Grab your favorite products at 50% off!" rows={4} {...field} /></FormControl>
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
              <FormControl><Input placeholder="E.g., /flash-sale or /customer/my-orders" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
          ) : (
            <><Send className="mr-2 h-4 w-4" /> {buttonText}</>
          )}
        </Button>
      </form>
    </Form>
  );
};


export default function NotificationsPage() {
  const { toast } = useToast();
  const { data: users } = useFirestoreQuery<UserData>('users');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const filteredUsers = useMemo(() => {
    if (!userSearchTerm || !users) return [];
    return users.filter(u =>
      u.displayName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
    ).slice(0, 5);
  }, [userSearchTerm, users]);
  
  const handleSelectUser = (user: UserData, form: any) => {
    setSelectedUser(user);
    form.setValue('userId', user.uid);
    setUserSearchTerm('');
  };

  const handleClearUser = (form: any) => {
      setSelectedUser(null);
      form.setValue('userId', '');
  };


  const handleSendToAll = async (values: z.infer<typeof toAllSchema>) => {
    try {
      const result = await sendNotification({ title: values.title, body: values.message, link: values.link || undefined });
      toast({ title: 'Notifications Sent!', description: `Successfully sent to ${result.successCount} users. Failed for ${result.failureCount}.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to send notifications', description: error.message || 'An error occurred.' });
    }
  };
  
  const handleSendToRole = async (values: z.infer<typeof toRoleSchema>) => {
     try {
        const result = await sendNotificationToRole({ ...values, link: values.link || undefined });
        if (result.success) {
            toast({ title: 'Notifications Sent!', description: result.message });
        } else {
             toast({ variant: 'destructive', title: 'Failed to send', description: result.message });
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Failed to send notifications', description: error.message || 'An error occurred.' });
    }
  };
  
  const handleSendToUser = async (values: z.infer<typeof toUserSchema>) => {
    try {
        const result = await sendTargetedNotification({ ...values, link: values.link || undefined });
        if (result.success) {
            toast({ title: 'Notification Sent!', description: result.message });
            setSelectedUser(null); // Clear selection on success
        } else {
            toast({ variant: 'destructive', title: 'Failed to send', description: result.message });
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Failed to send notification', description: error.message || 'An error occurred.' });
    }
  };


  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold font-headline">Push Notifications</h1>
      
      <Card className="shadow-lg border-2">
         <Tabs defaultValue="all" className="w-full">
            <CardHeader>
                <div className="w-full overflow-x-auto no-scrollbar">
                  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
                      <TabsTrigger value="all"><Users className="mr-2 h-4 w-4" /> To All Users</TabsTrigger>
                      <TabsTrigger value="role"><User className="mr-2 h-4 w-4" /> By Role</TabsTrigger>
                      <TabsTrigger value="user"><User className="mr-2 h-4 w-4" /> To Specific User</TabsTrigger>
                  </TabsList>
                </div>
            </CardHeader>
            <CardContent>
                <TabsContent value="all">
                     <CardTitle className="mb-1">Send to All Users</CardTitle>
                     <CardDescription className="mb-6">Send a message to every subscribed user on the platform.</CardDescription>
                     <NotificationForm schema={toAllSchema} onSubmit={handleSendToAll} buttonText="Send to All Users">
                        {() => null}
                     </NotificationForm>
                </TabsContent>
                <TabsContent value="role">
                     <CardTitle className="mb-1">Send to a User Role</CardTitle>
                     <CardDescription className="mb-6">Target a specific group of users like customers, vendors, or riders.</CardDescription>
                     <NotificationForm schema={toRoleSchema} onSubmit={handleSendToRole} buttonText="Send to Role">
                        {(form: any) => (
                           <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>User Role</Label>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select a role..." /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="customer">Customer</SelectItem>
                                            <SelectItem value="vendor">Vendor</SelectItem>
                                            <SelectItem value="rider">Rider</SelectItem>
                                            <SelectItem value="outlet">Outlet Manager</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                        )}
                    </NotificationForm>
                </TabsContent>
                <TabsContent value="user">
                    <CardTitle className="mb-1">Send to a Specific User</CardTitle>
                    <CardDescription className="mb-6">Find a user and send them a direct notification.</CardDescription>
                    <NotificationForm schema={toUserSchema} onSubmit={handleSendToUser} buttonText="Send to User">
                        {(form: any) => (
                          <div className="space-y-2">
                             <Label>User</Label>
                             {selectedUser ? (
                                <div className="flex items-center justify-between p-3 border-2 border-dashed rounded-lg bg-green-50">
                                    <div>
                                        <p className="font-bold text-sm text-green-800">{selectedUser.displayName}</p>
                                        <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleClearUser(form)}><XCircle className="h-4 w-4" /></Button>
                                </div>
                             ) : (
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={userSearchTerm}
                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                     {userSearchTerm && (
                                        <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                                            {filteredUsers.length > 0 ? filteredUsers.map((u: UserData) => (
                                                <div
                                                    key={u.uid}
                                                    onClick={() => handleSelectUser(u, form)}
                                                    className="p-3 hover:bg-muted cursor-pointer border-b"
                                                >
                                                    <p className="font-semibold text-sm">{u.displayName}</p>
                                                    <p className="text-xs text-muted-foreground">{u.email}</p>
                                                </div>
                                            )) : (
                                                <div className="p-3 text-center text-xs text-muted-foreground">
                                                    No users found.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                             )}
                              <FormField control={form.control} name="userId" render={() => (<FormMessage/>)}/>
                          </div>
                        )}
                    </NotificationForm>
                </TabsContent>
            </CardContent>
         </Tabs>
      </Card>
    </div>
  );
}
