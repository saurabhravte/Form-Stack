'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { LoginStep1Schema, LoginStep2Schema } from '@formstack/shared';

import { AuthSplitLayout } from '@/components/auth/auth-split-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stepper } from '@/components/ui/stepper';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/stores/useAuthStore';

type Step1Values = z.infer<typeof LoginStep1Schema>;
type Step2Values = z.infer<typeof LoginStep2Schema>;

export default function SignInPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [showPw, setShowPw] = useState(false);

  
  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(LoginStep1Schema),
    defaultValues: { email: '' },
  });

  const step2Form = useForm<Step2Values>({
    resolver: zodResolver(LoginStep2Schema),
    defaultValues: { password: '' },
  });

  const login = trpc.auth.login.useMutation({
    onSuccess: (res) => {
      setSession(res.user, res.workspaceId);
      toast.success(`Welcome back, ${res.user.name.split(' ')[0]}`);
     
      router.replace('/dashboard');
    },
    onError: (err) => {
      const code = (err.data as { code?: string } | undefined)?.code;
      if (code === 'UNAUTHORIZED' || code === 'NOT_FOUND') {
        toast.error('Email or password is incorrect.');
        setStep(0);
        step2Form.reset();
      } else {
        toast.error(err.message || 'Sign in failed');
      }
    },
  });

  const onStep1 = step1Form.handleSubmit((values) => {
    setEmail(values.email);
    setStep(1);
  });

  const onStep2 = step2Form.handleSubmit((values) => {
    login.mutate({ email, password: values.password });
  });

  return (
    <AuthSplitLayout
      title="Sign in"
      subtitle={
        <>Sign in to open your workspace, forms, themes, and saved templates in one place.</>
      }
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/auth/sign-up" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <Stepper steps={['Email', 'Password']} current={step} className="mb-8" />

      {step === 0 && (
        <form onSubmit={onStep1} className="space-y-5 animate-fade-in">
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              {...step1Form.register('email')}
            />
            {step1Form.formState.errors.email && (
              <p className="text-xs text-primary">{step1Form.formState.errors.email.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" size="lg">
            Continue <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
            Demo: <code className="font-mono text-foreground">demo@formstack.dev</code> /{' '}
            <code className="font-mono text-foreground">Demo1234!</code>
          </div>
        </form>
      )}

      {step === 1 && (
        <form onSubmit={onStep2} className="space-y-5 animate-fade-in">
          <div className="rounded-md bg-muted px-3 py-2.5 text-sm flex items-center justify-between">
            <span className="truncate text-muted-foreground">{email}</span>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> Change
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button type="button" className="text-xs text-muted-foreground hover:text-foreground">
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                autoFocus
                {...step2Form.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                aria-label="Toggle password visibility"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {step2Form.formState.errors.password && (
              <p className="text-xs text-primary">{step2Form.formState.errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={login.isPending}>
            {login.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
            ) : (
              <>Sign in <ArrowRight className="h-4 w-4" /></>
            )}
          </Button>
        </form>
      )}
    </AuthSplitLayout>
  );
}