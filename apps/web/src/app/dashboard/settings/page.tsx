'use client';

import { Bell, Globe, KeyRound, Loader2, Mail, Save, Shield, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/stores/useAuthStore';

type Tab = 'profile' | 'account' | 'notifications' | 'security' | 'workspace';

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Mail },
  { id: 'workspace', label: 'Workspace', icon: Globe },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<Tab>('profile');

  // Local form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [workspaceName, setWorkspaceName] = useState('My Workspace');
  const [saving, setSaving] = useState(false);

  const [emailDigest, setEmailDigest] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);
  const [responseAlerts, setResponseAlerts] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setEmail(user.email ?? '');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    // Persist locally for now; wire to trpc.users.update / trpc.workspaces.update when those endpoints exist.
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'formstack:settings',
          JSON.stringify({ name, email, bio, workspaceName, emailDigest, productUpdates, responseAlerts }),
        );
      }
      await new Promise((r) => setTimeout(r, 500));
      toast.success('Settings saved');
    } catch {
      toast.error('Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="font-display text-2xl md:text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1.5 text-sm md:text-base">
          Manage your profile, workspace, and preferences.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 md:gap-8">
        {/* Side tabs */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap',
                  active
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Panels */}
        <div className="min-w-0">
          {tab === 'profile' && (
            <Card className="p-5 md:p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/15 text-primary grid place-items-center text-2xl font-bold">
                  {(name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <Button size="sm" variant="outline">Upload photo</Button>
                  <p className="text-xs text-muted-foreground mt-1.5">PNG/JPG, max 2MB.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <Label htmlFor="bio">Short bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people a little about yourself…"
                />
              </div>
              <SaveBar saving={saving} onSave={handleSave} />
            </Card>
          )}

          {tab === 'account' && (
            <Card className="p-5 md:p-6 space-y-5">
              <Section title="Email address">
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </Section>
              <div className="border-t border-border" />
              <Section title="Current plan">
                <div className="flex items-center justify-between p-4 rounded-xl bg-pastel-mint border border-border">
                  <div>
                    <Badge variant="success">Pro</Badge>
                    <p className="text-sm mt-2">Unlimited forms · 100k responses / month</p>
                  </div>
                  <Button variant="outline" size="sm">Manage plan</Button>
                </div>
              </Section>
              <div className="border-t border-border" />
              <Section title="Danger zone" tone="danger">
                <Button variant="destructive" size="sm">Delete account</Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Deleting your account permanently removes all forms and responses.
                </p>
              </Section>
            </Card>
          )}

          {tab === 'workspace' && (
            <Card className="p-5 md:p-6">
              <div className="space-y-2 mb-5">
                <Label htmlFor="ws-name">Workspace name</Label>
                <Input
                  id="ws-name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
              </div>
              <div className="space-y-2 mb-6">
                <Label>Workspace URL</Label>
                <div className="flex items-center gap-2 text-sm bg-muted/60 border border-border rounded-md px-3 py-2.5">
                  <span className="text-muted-foreground">formstack.dev/</span>
                  <span className="font-mono font-medium">
                    {workspaceName.toLowerCase().replace(/\s+/g, '-')}
                  </span>
                </div>
              </div>
              <SaveBar saving={saving} onSave={handleSave} />
            </Card>
          )}

          {tab === 'notifications' && (
            <Card className="p-5 md:p-6">
              <Toggle
                label="Email digest"
                description="Weekly summary of your forms' activity."
                checked={emailDigest}
                onChange={setEmailDigest}
              />
              <div className="border-t border-border my-4" />
              <Toggle
                label="Response alerts"
                description="Email me when someone submits a form."
                checked={responseAlerts}
                onChange={setResponseAlerts}
              />
              <div className="border-t border-border my-4" />
              <Toggle
                label="Product updates"
                description="Occasional emails about new features."
                checked={productUpdates}
                onChange={setProductUpdates}
              />
              <div className="mt-6">
                <SaveBar saving={saving} onSave={handleSave} />
              </div>
            </Card>
          )}

          {tab === 'security' && (
            <Card className="p-5 md:p-6 space-y-5">
              <Section title="Password">
                <div className="flex items-center gap-3">
                  <KeyRound className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Change password</p>
                    <p className="text-xs text-muted-foreground">Last changed 3 months ago.</p>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </Section>
              <div className="border-t border-border" />
              <Section title="Two-factor authentication">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                  <Button variant="outline" size="sm">Enable 2FA</Button>
                </div>
              </Section>
              <div className="border-t border-border" />
              <Section title="Active sessions">
                <p className="text-sm text-muted-foreground mb-2">You&apos;re signed in on 1 device.</p>
                <Button variant="outline" size="sm">Sign out all other sessions</Button>
              </Section>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  tone,
}: {
  title: string;
  children: React.ReactNode;
  tone?: 'danger';
}) {
  return (
    <div>
      <h3 className={cn('font-display font-semibold mb-3', tone === 'danger' && 'text-red-500')}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-muted',
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}

function SaveBar({ saving, onSave }: { saving: boolean; onSave: () => void }) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="ghost">Cancel</Button>
      <Button onClick={onSave} disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Saving…
          </>
        ) : (
          <>
            <Save className="h-4 w-4" /> Save changes
          </>
        )}
      </Button>
    </div>
  );
}