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

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      router.push('/login');
      return;
    }
    api.get('/auth/me/').then(({ data }) => {
      setProfile(data);
      setLoading(false);
    }).catch(() => {
      router.push('/login');
    });
  }, [router]);

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
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500">Username</label>
              <p className="font-semibold text-gray-900">{profile.username}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Full Name</label>
              <p className="font-semibold text-gray-900">{profile.full_name}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Email</label>
              <p className="font-semibold text-gray-900">{profile.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Phone Number</label>
              <p className="font-semibold text-gray-900">{profile.phone_number}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Age</label>
              <p className="font-semibold text-gray-900">{profile.age}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Role</label>
              <p className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                {profile.role.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
