'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface UserProfile {
  username: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  age: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      router.push('/login');
      return;
    }
    api.get('/auth/me/').then(({ data }) => {
      setProfile(data);
      setForm(data);
      setLoading(false);
    }).catch(() => {
      router.push('/login');
    });
  }, [router]);

  const handleSave = async () => {
    try {
      const { data } = await api.patch('/auth/me/', form);
      setProfile(data);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch {
      alert('Failed to update profile.');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-bold text-blue-600">My Profile</h1>
          <Link href="/dashboard" className="text-sm font-semibold text-gray-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Personal Info</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="text-sm font-semibold text-blue-600 hover:underline">
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { setForm(profile); setEditing(false); }} className="text-sm font-semibold text-gray-500 hover:underline">
                  Cancel
                </button>
                <button onClick={handleSave} className="text-sm font-semibold text-blue-600 hover:underline">
                  Save
                </button>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500">Username</label>
              <p className="font-semibold text-gray-900">{profile.username}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Role</label>
              <p className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                {profile.role.toUpperCase()}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Full Name</label>
              {editing ? (
                <input type="text" value={form.full_name || ''} onChange={e => setForm({...form, full_name: e.target.value})} className="mt-1 block w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              ) : (
                <p className="font-semibold text-gray-900">{profile.full_name}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500">Phone Number</label>
              {editing ? (
                <input type="text" value={form.phone_number || ''} onChange={e => setForm({...form, phone_number: e.target.value})} className="mt-1 block w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              ) : (
                <p className="font-semibold text-gray-900">{profile.phone_number}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500">Age</label>
              {editing ? (
                <input type="number" value={form.age || ''} onChange={e => setForm({...form, age: Number(e.target.value)})} className="mt-1 block w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              ) : (
                <p className="font-semibold text-gray-900">{profile.age}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
