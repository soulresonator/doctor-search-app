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

interface Appointment {
  id: string;
  doctor_name: string;
  patient_name: string;
  scheduled_at: string;
  status: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/doctors/appointments/');
      setAppointments(data);
    } catch {
      console.error('Failed to load appointments');
    }
  };

  const bookAppointment = async (doctorId: string) => {
    const date = window.prompt('Enter date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!date) return;
    try {
      await api.post('/doctors/appointments/', {
        doctor: doctorId,
        scheduled_at: `${date}T09:00:00Z`, // Default 9 AM
        note: 'Requested via dashboard'
      });
      fetchAppointments();
      alert('Booked successfully!');
    } catch {
      alert('Failed to book.');
    }
  };

  const updateStatus = async (apptId: string) => {
    const status = window.prompt('Enter new status (confirmed/cancelled):');
    if (!status) return;
    try {
      await api.patch(`/doctors/appointments/${apptId}/status/`, { status });
      fetchAppointments();
    } catch {
      alert('Failed to update status. Only doctors can do this.');
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      router.push('/login');
      return;
    }
    fetchDoctors({});
    fetchAppointments();
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

        {/* Appointments Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Appointments</h2>
          {appointments.length === 0 ? (
            <p className="text-gray-500">No appointments.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {appointments.map((appt) => (
                <div key={appt.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="font-semibold">{appt.doctor_name || appt.patient_name}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(appt.scheduled_at).toLocaleString()}
                  </p>
                  <p className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                    {appt.status.toUpperCase()}
                  </p>
                  {/* Doctor can confirm/cancel, patient can just see. We'll show a prompt for status update if clicked */}
                  <button 
                    onClick={() => updateStatus(appt.id)}
                    className="ml-3 text-xs text-blue-600 underline"
                  >
                    Update Status (Doctor)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <h2 className="mb-4 mt-8 text-xl font-bold text-gray-900">Doctors</h2>
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
              <button 
                onClick={() => bookAppointment(doc.id)}
                className="mt-4 w-full rounded bg-blue-50 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-100"
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
