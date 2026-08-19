'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

const FIELDS = [
  { name: 'username', label: 'Username', type: 'text' },
  { name: 'password', label: 'Password', type: 'password' },
  { name: 'full_name', label: 'Full Name', type: 'text' },
  { name: 'phone_number', label: 'Phone Number', type: 'tel' },
  { name: 'age', label: 'Age', type: 'number' },
  { name: 'gender', label: 'Gender', type: 'text' },
  { name: 'occupation', label: 'Occupation', type: 'text' },
] as const;

type FieldName = (typeof FIELDS)[number]['name'];

type FormState = Record<FieldName, string>;

const INITIAL: FormState = {
  username: '', password: '', full_name: '', phone_number: '',
  age: '', gender: '', occupation: '',
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register/', { ...form, age: Number(form.age) });
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
          {FIELDS.map(({ name, label, type }) => (
            <div key={name}>
              <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
              <input
                type={type}
                required
                value={form[name]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
