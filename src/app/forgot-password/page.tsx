'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AverzoLogo from '@/components/averzo-logo';
import { FirebaseClientProvider } from '@/firebase';
import { sendPasswordResetLink } from '@/actions/auth-actions';
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});

function ForgotPasswordPageContent() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const result = await sendPasswordResetLink({ email: values.email });
      if (result.success) {
        toast({
          title: 'Check Your Console',
          description: result.message,
        });
        form.reset();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Sending Link',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <AverzoLogo className="mx-auto mb-4" />
          <CardTitle>Forgot Password?</CardTitle>
          <CardDescription>
            No worries! Enter your email and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <Button variant="link" asChild>
                <Link href="/login" className="flex items-center justify-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
    return (
        <FirebaseClientProvider>
            <ForgotPasswordPageContent />
        </FirebaseClientProvider>
    )
}
