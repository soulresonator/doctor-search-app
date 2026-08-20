'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

const FIELDS = [
  { name: 'username', label: 'Username', type: 'text', minLength: 3 },
  { name: 'password', label: 'Password', type: 'password', minLength: 6 },
  { name: 'confirm_password', label: 'Confirm Password', type: 'password', minLength: 6 },
  { name: 'full_name', label: 'Full Name', type: 'text' },
  { name: 'phone_number', label: 'Phone Number', type: 'tel', pattern: '^\\+?[0-9]{7,15}$' },
  { name: 'age', label: 'Age', type: 'number', min: 1, max: 120 },
  { name: 'gender', label: 'Gender', type: 'text' },
  { name: 'occupation', label: 'Occupation', type: 'text' },
] as const;

type FieldName = (typeof FIELDS)[number]['name'];
type FormState = Record<FieldName, string>;

const INITIAL: FormState = {
  username: '', password: '', confirm_password: '', full_name: '', phone_number: '',
  age: '', gender: '', occupation: '',
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});

  const getFieldError = (name: FieldName): string | null => {
    if (!touched[name]) return null;
    const v = form[name];
    if (!v) return 'Required';
    if (name === 'password' && v.length < 6) return 'Min 6 chars';
    if (name === 'confirm_password' && v !== form.password) return 'Passwords do not match';
    if (name === 'age' && (Number(v) < 1 || Number(v) > 120)) return 'Invalid age';
    if (name === 'phone_number' && !/^\+?[0-9]{7,15}$/.test(v)) return 'Invalid phone format';
    return null;
  };

  const isFormValid = FIELDS.every(f => form[f.name]) && !FIELDS.some(f => {
    touched[f.name] = true; 
    return getFieldError(f.name);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setTouched(FIELDS.reduce((acc, f) => ({ ...acc, [f.name]: true }), {}));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { confirm_password, ...apiData } = form;
      await api.post('/auth/register/', { ...apiData, age: Number(form.age) });
      // Auto-login after registration
      const { data } = await api.post('/auth/login/', {
        username: form.username,
        password: form.password,
      });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Create Account</h1>
        {error && <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {FIELDS.map(({ name, label, type, ...rest }) => (
            <div key={name}>
              <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
              <input
                type={type}
                required
                {...rest}
                value={form[name]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                onBlur={() => setTouched({ ...touched, [name]: true })}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  getFieldError(name) ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {getFieldError(name) && <p className="mt-1 text-xs text-red-600">{getFieldError(name)}</p>}
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
