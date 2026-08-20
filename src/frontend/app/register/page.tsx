'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

type FormState = {
  username: string; password: string; confirm_password: string; full_name: string; 
  phone_number: string; age: string; gender: string; occupation: string;
};

const INITIAL: FormState = {
  username: '', password: '', confirm_password: '', full_name: '', phone_number: '',
  age: '', gender: '', occupation: '',
};

const COUNTRY_CODES = [
  { code: '+1', label: '+1 (US/CA)' },
  { code: '+44', label: '+44 (UK)' },
  { code: '+61', label: '+61 (AU)' },
  { code: '+91', label: '+91 (IN)' },
  { code: '+84', label: '+84 (VN)' },
  { code: '+81', label: '+81 (JP)' },
  { code: '+49', label: '+49 (DE)' },
];

const OCCUPATIONS = [
  'Engineer', 'Doctor', 'Teacher', 'Student', 'Artist', 'Business', 'Other'
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [phonePrefix, setPhonePrefix] = useState('+1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const getFieldError = (name: string): string | null => {
    if (!touched[name]) return null;
    const v = (form as any)[name];
    if (!v) return 'Required';
    if (name === 'password' && v.length < 8) return 'Min 8 chars';
    if (name === 'confirm_password' && v !== form.password) return 'Passwords do not match';
    if (name === 'age' && (Number(v) < 1 || Number(v) > 120)) return 'Invalid age';
    if (name === 'phone_number') {
      if (!/^[0-9]{9,11}$/.test(v)) return 'Must be 9-11 digits';
    }
    return null;
  };

  const isFormValid = Object.keys(form).every(k => (form as any)[k]) && 
                      !Object.keys(form).some(k => getFieldError(k));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all as touched
    const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    if (!isFormValid) return;
    
    setError('');
    setLoading(true);
    try {
      const { confirm_password, phone_number, ...apiData } = form;
      const fullPhone = `${phonePrefix}${phone_number}`;
      
      await api.post('/auth/register/', { 
        ...apiData, 
        age: Number(form.age),
        phone_number: fullPhone
      });
      
      const { data } = await api.post('/auth/login/', {
        username: form.username,
        password: form.password,
      });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.data) {
        const data = err.response.data;
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${v}`);
        setError(msgs.join(' | '));
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // For phone number, only allow digits
    if (name === 'phone_number') {
      const numericValue = value.replace(/\D/g, '');
      setForm(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (e: React.FocusEvent<any>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const inputClass = (name: string) => `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
    getFieldError(name) ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
  }`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Create Account</h1>
        {error && <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
            <input type="text" name="username" required value={form.username} onChange={handleChange} onBlur={handleBlur} className={inputClass('username')} minLength={3} />
            {getFieldError('username') && <p className="mt-1 text-xs text-red-600">{getFieldError('username')}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="full_name" required value={form.full_name} onChange={handleChange} onBlur={handleBlur} className={inputClass('full_name')} />
            {getFieldError('full_name') && <p className="mt-1 text-xs text-red-600">{getFieldError('full_name')}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
            <div className="flex gap-2">
              <select 
                value={phonePrefix} 
                onChange={e => setPhonePrefix(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
              <input type="tel" name="phone_number" required value={form.phone_number} onChange={handleChange} onBlur={handleBlur} className={inputClass('phone_number')} placeholder="e.g. 123456789" />
            </div>
            {getFieldError('phone_number') && <p className="mt-1 text-xs text-red-600">{getFieldError('phone_number')}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Age</label>
              <input type="number" name="age" required min="1" max="120" value={form.age} onChange={handleChange} onBlur={handleBlur} className={inputClass('age')} />
              {getFieldError('age') && <p className="mt-1 text-xs text-red-600">{getFieldError('age')}</p>}
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Occupation</label>
              <select name="occupation" required value={form.occupation} onChange={handleChange} onBlur={handleBlur} className={inputClass('occupation')}>
                <option value="" disabled>Select...</option>
                {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              {getFieldError('occupation') && <p className="mt-1 text-xs text-red-600">{getFieldError('occupation')}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
            <div className="flex items-center gap-4 py-2">
              <label className="flex items-center gap-1 text-sm text-gray-700">
                <input type="radio" name="gender" value="Male" checked={form.gender === 'Male'} onChange={handleChange} onBlur={handleBlur} /> Male
              </label>
              <label className="flex items-center gap-1 text-sm text-gray-700">
                <input type="radio" name="gender" value="Female" checked={form.gender === 'Female'} onChange={handleChange} onBlur={handleBlur} /> Female
              </label>
              <label className="flex items-center gap-1 text-sm text-gray-700">
                <input type="radio" name="gender" value="Other" checked={form.gender === 'Other'} onChange={handleChange} onBlur={handleBlur} /> Other
              </label>
            </div>
            {getFieldError('gender') && <p className="mt-1 text-xs text-red-600">{getFieldError('gender')}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" required minLength={8} value={form.password} onChange={handleChange} onBlur={handleBlur} className={inputClass('password')} />
            {getFieldError('password') && <p className="mt-1 text-xs text-red-600">{getFieldError('password')}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Confirm Password</label>
            <input type="password" name="confirm_password" required minLength={8} value={form.confirm_password} onChange={handleChange} onBlur={handleBlur} className={inputClass('confirm_password')} />
            {getFieldError('confirm_password') && <p className="mt-1 text-xs text-red-600">{getFieldError('confirm_password')}</p>}
          </div>

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
