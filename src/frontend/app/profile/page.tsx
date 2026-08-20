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
  avatar: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
      const formData = new FormData();
      if (form.full_name) formData.append('full_name', form.full_name);
      if (form.phone_number) formData.append('phone_number', form.phone_number);
      if (form.age) formData.append('age', form.age.toString());
      if (avatarFile) formData.append('avatar', avatarFile);

      const { data } = await api.patch('/auth/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(data);
      setEditing(false);
      setAvatarFile(null);
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
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Personal Info</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="text-sm font-semibold text-blue-600 hover:underline">
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { setForm(profile); setAvatarFile(null); setEditing(false); }} className="text-sm font-semibold text-gray-500 hover:underline">
                  Cancel
                </button>
                <button onClick={handleSave} className="text-sm font-semibold text-blue-600 hover:underline">
                  Save
                </button>
              </div>
            )}
          </div>
          
          <div className="mb-6 flex items-center gap-6">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-200">
              {avatarFile ? (
                <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="h-full w-full object-cover" />
              ) : profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
            {editing && (
              <input 
                type="file" 
                accept="image/*"
                onChange={e => e.target.files && setAvatarFile(e.target.files[0])}
                className="text-sm"
              />
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500">Username</label>
              <p className="font-semibold text-gray-900">{profile.username}</p>
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
