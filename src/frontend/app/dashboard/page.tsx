'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Doctor {
  id: string;
  full_name: string;
  gender: string;
  years_of_experience: number | null;
  specialty: { id: string; name: string };
  hospital: { id: string; name: string; location: string };
}

export default function DashboardPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', specialty: '', location: '', gender: '' });

  const fetchDoctors = async (params: Record<string, string>) => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v))
      ).toString();
      const { data } = await api.get(`/doctors/${query ? `?${query}` : ''}`);
      setDoctors(data);
    } catch {
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      router.push('/login');
      return;
    }
    fetchDoctors({});
  }, [router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors(filters);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-bold text-blue-600">DoctorApp</h1>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Find a Doctor</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              placeholder="Name"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Specialty"
              value={filters.specialty}
              onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>

        {/* Results */}
        {error && <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        {doctors.length === 0 && !loading && (
          <p className="text-center text-gray-500">No doctors found.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doc) => (
            <div key={doc.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900">{doc.full_name}</h3>
              <p className="mt-1 text-sm text-blue-600">{doc.specialty.name}</p>
              <p className="mt-1 text-sm text-gray-500">{doc.hospital.name}</p>
              <p className="text-sm text-gray-400">{doc.hospital.location}</p>
              {doc.years_of_experience != null && (
                <p className="mt-2 text-xs text-gray-400">{doc.years_of_experience} yrs exp.</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
