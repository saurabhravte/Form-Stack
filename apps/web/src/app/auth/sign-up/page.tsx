'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { RegisterStep1Schema, RegisterStep2Schema, RegisterStep3Schema } from '@formstack/shared';

import { AuthSplitLayout } from '@/components/auth/auth-split-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stepper } from '@/components/ui/stepper';
import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/stores/useAuthStore';

type S1 = z.infer<typeof RegisterStep1Schema>;
type S2 = z.infer<typeof RegisterStep2Schema>;
type S3 = z.infer<typeof RegisterStep3Schema>;

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

export default function SignUpPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const [step, setStep] = useState(0);
  const [s1, setS1] = useState<S1 | null>(null);
  const [s2, setS2] = useState<S2 | null>(null);
  const [showPw, setShowPw] = useState(false);

  const step1 = useForm<S1>({ resolver: zodResolver(RegisterStep1Schema), defaultValues: { name: '', email: '' } });
  const step2 = useForm<S2>({ resolver: zodResolver(RegisterStep2Schema), defaultValues: { password: '', confirmPassword: '' } });
  const step3 = useForm<S3>({ resolver: zodResolver(RegisterStep3Schema), defaultValues: { workspaceName: '', workspaceSlug: '' } });

  // Auto-suggest workspaceSlug from workspaceName
  const wsName = step3.watch('workspaceName');
  useEffect(() => {
    if (!step3.formState.dirtyFields.workspaceSlug && wsName) {
      step3.setValue('workspaceSlug', slugify(wsName), { shouldValidate: false });
    }
  }, [wsName, step3]);

  const register = trpc.auth.register.useMutation({
    onSuccess: (res) => {
      setSession(res.user, res.workspaceId);
      toast.success(`Workspace ${step3.getValues('workspaceSlug')} created`);
      router.push('/dashboard');
    },
    onError: (err) => {
      const code = (err.data as { code?: string } | undefined)?.code;
      if (code === 'CONFLICT') {
        toast.error('That email or workspace slug is already in use.');
      } else {
        toast.error(err.message || 'Sign up failed');
      }
    },
  });

  return (
    <AuthSplitLayout
      title="Create account"
      subtitle="Spin up a workspace in under a minute. No credit card, no setup wizard."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </>
      }
      panelGlyph="🚀"
    >
      <Stepper steps={['You', 'Password', 'Workspace']} current={step} className="mb-8" />

      {step === 0 && (
        <form
          onSubmit={step1.handleSubmit((v) => {
            setS1(v);
            setStep(1);
          })}
          className="space-y-5 animate-fade-in"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" autoComplete="name" placeholder="Ada Lovelace" {...step1.register('name')} />
            {step1.formState.errors.name && (
              <p className="text-xs text-primary">{step1.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="ada@company.com" {...step1.register('email')} />
            {step1.formState.errors.email && (
              <p className="text-xs text-primary">{step1.formState.errors.email.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" size="lg">
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      )}

      {step === 1 && (
        <form
          onSubmit={step2.handleSubmit((v) => {
            setS2(v);
            setStep(2);
          })}
          className="space-y-5 animate-fade-in"
        >
          <BackChip onClick={() => setStep(0)} label={s1?.email ?? ''} />
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                {...step2.register('password')}
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
            <p className="text-[11px] text-muted-foreground">
              Min 8 chars with upper, lower, and a number.
            </p>
            {step2.formState.errors.password && (
              <p className="text-xs text-primary">{step2.formState.errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              {...step2.register('confirmPassword')}
            />
            {step2.formState.errors.confirmPassword && (
              <p className="text-xs text-primary">{step2.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" size="lg">
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={step3.handleSubmit((v) => {
            if (!s1 || !s2) return;
            register.mutate({
              name: s1.name,
              email: s1.email,
              password: s2.password,
              workspaceName: v.workspaceName,
              workspaceSlug: v.workspaceSlug,
            });
          })}
          className="space-y-5 animate-fade-in"
        >
          <BackChip onClick={() => setStep(1)} label="Password set" />
          <div className="space-y-2">
            <Label htmlFor="ws">Workspace name</Label>
            <Input id="ws" placeholder="Acme Inc." {...step3.register('workspaceName')} />
            {step3.formState.errors.workspaceName && (
              <p className="text-xs text-primary">{step3.formState.errors.workspaceName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Workspace URL</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-xs text-muted-foreground bg-muted rounded-l-md border border-r-0 border-border">
                formstack.dev/
              </span>
              <Input
                id="slug"
                className="rounded-l-none"
                placeholder="acme"
                {...step3.register('workspaceSlug')}
              />
            </div>
            {step3.formState.errors.workspaceSlug && (
              <p className="text-xs text-primary">{step3.formState.errors.workspaceSlug.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={register.isPending}>
            {register.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating workspace…
              </>
            ) : (
              <>Create workspace</>
            )}
          </Button>
        </form>
      )}
    </AuthSplitLayout>
  );
}

function BackChip({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <div className="rounded-md bg-muted px-3 py-2.5 text-sm flex items-center justify-between">
      <span className="truncate text-muted-foreground">{label}</span>
      <button
        type="button"
        onClick={onClick}
        className="text-xs text-primary hover:underline flex items-center gap-1"
      >
        <ArrowLeft className="h-3 w-3" /> Back
      </button>
    </div>
  );
}
