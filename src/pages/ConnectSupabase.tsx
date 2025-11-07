import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Check, X, AlertCircle, Copy } from 'lucide-react';

const SQL_SETUP = `
-- TABLE
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text generated always as (regexp_replace(lower(title), '[^a-z0-9]+','-','g')) stored unique,
  description text,
  price numeric(12,2),
  city text,
  location text,
  area numeric,
  bedrooms int,
  bathrooms int,
  type text,
  status text default 'active',
  images jsonb default '[]',
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.properties enable row level security;

-- Public read
create policy "Public can read properties"
on public.properties for select
to anon, authenticated
using (true);

-- Admin write (JWT claim is_admin = true)
create policy "Admins can insert properties"
on public.properties for insert
to authenticated
with check (auth.jwt() ->> 'is_admin' = 'true');
create policy "Admins can update properties"
on public.properties for update
to authenticated
using (auth.jwt() ->> 'is_admin' = 'true');
create policy "Admins can delete properties"
on public.properties for delete
to authenticated
using (auth.jwt() ->> 'is_admin' = 'true');

-- STORAGE
select storage.create_bucket('property-images', public := true);
create policy "Public read property-images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'property-images');
create policy "Authenticated write property-images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'property-images');
create policy "Authenticated update/delete property-images"
on storage.objects for update to authenticated using (bucket_id = 'property-images');
create policy "Authenticated delete property-images"
on storage.objects for delete to authenticated using (bucket_id = 'property-images');
`.trim();

export default function ConnectSupabase() {
  const { user, isLoading, login, logout, session } = useSupabaseAuth();
  const [envLoaded, setEnvLoaded] = useState(false);
  const [authHealthy, setAuthHealthy] = useState<boolean | null>(null);
  const [dbHealthy, setDbHealthy] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [firstProperty, setFirstProperty] = useState<any>(null);

  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    setEnvLoaded(!!url && !!key);

    if (url && key) {
      testAuth(url);
      testDb();
    }
  }, []);

  const testAuth = async (url: string) => {
    try {
      const response = await fetch(`${url}/auth/v1/health`);
      setAuthHealthy(response.ok);
    } catch (error) {
      setAuthHealthy(false);
    }
  };

  const testDb = async () => {
    try {
      const { data, error } = await supabase.from('properties').select('*').limit(1);
      if (error?.message.includes('does not exist')) {
        setDbHealthy(false);
      } else if (error?.message.includes('permission denied')) {
        setDbHealthy(false);
      } else {
        setDbHealthy(true);
        if (data && data.length > 0) {
          setFirstProperty(data[0]);
        }
      }
    } catch {
      setDbHealthy(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    const result = await login(email, password);
    setIsLoggingIn(false);
    
    if (!result.success) {
      toast.error(result.error || 'Login failed');
    } else {
      toast.success('Logged in successfully');
      setEmail('');
      setPassword('');
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (!result.success) {
      toast.error(result.error || 'Logout failed');
    } else {
      toast.success('Logged out successfully');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(SQL_SETUP);
    toast.success('SQL copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Supabase Connection Test</h1>
          <p className="text-gray-600 mt-2">Verify your Supabase setup and test connectivity</p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* ENV Check */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {envLoaded ? <Check className="text-green-600" /> : <X className="text-red-600" />}
                Environment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {envLoaded
                  ? `✓ Loaded (Key: ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 6)}...)`
                  : '✗ Missing env variables'}
              </p>
            </CardContent>
          </Card>

          {/* Auth Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {authHealthy === null ? (
                  <AlertCircle className="text-gray-400" />
                ) : authHealthy ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
                Auth Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {authHealthy === null
                  ? 'Testing...'
                  : authHealthy
                  ? '✓ Auth service healthy'
                  : '✗ Auth service unreachable'}
              </p>
            </CardContent>
          </Card>

          {/* Database */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {dbHealthy === null ? (
                  <AlertCircle className="text-gray-400" />
                ) : dbHealthy ? (
                  <Check className="text-green-600" />
                ) : (
                  <X className="text-red-600" />
                )}
                Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {dbHealthy === null
                  ? 'Testing...'
                  : dbHealthy
                  ? '✓ Properties table accessible'
                  : '✗ Table missing or permission denied'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Setup Banner */}
        {dbHealthy === false && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-900">
                <AlertCircle className="text-yellow-600" />
                Run SQL Setup
              </CardTitle>
              <CardDescription className="text-yellow-800">
                Your properties table doesn't exist or you need to set up RLS policies. Copy and paste the SQL below into your Supabase SQL editor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <pre className="bg-white p-4 rounded-lg overflow-auto text-xs border border-yellow-200 max-h-64">
                {SQL_SETUP}
              </pre>
              <Button onClick={copyToClipboard} className="w-full">
                <Copy className="mr-2" size={16} />
                Copy SQL to Clipboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* First Property */}
        {firstProperty && (
          <Card>
            <CardHeader>
              <CardTitle>Sample Data Retrieved</CardTitle>
              <CardDescription>First property from database</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(firstProperty, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Auth Section */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test</CardTitle>
            <CardDescription>
              {user ? `Logged in as: ${user.email}` : 'Not logged in'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user ? (
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  onClick={handleLogin}
                  disabled={isLoggingIn || !email || !password}
                  className="w-full"
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            ) : (
              <Button onClick={handleLogout} className="w-full" variant="destructive">
                Logout
              </Button>
            )}
            {session && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                <p className="font-mono text-xs break-all">
                  JWT: {session.access_token.substring(0, 50)}...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
