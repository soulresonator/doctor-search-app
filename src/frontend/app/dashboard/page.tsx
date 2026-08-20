'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Doctor {
  id: string;
  full_name: string;
  gender: string;
  years_of_experience: number | null;
  image: string | null;
  specialty: { id: string; name: string };
  hospital: { id: string; name: string; location: string };
}


interface Appointment {
  id: string;
  doctor_name: string;
  patient_name: string;
  scheduled_at: string;
  status: string;
  note?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', specialty: '', location: '', gender: '' });

  const [options, setOptions] = useState<{ specialties: string[], locations: string[] }>({ specialties: [], locations: [] });
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null, current: 1 });

  const fetchOptions = async () => {
    try {
      const { data } = await api.get('/doctors/options/');
      setOptions(data);
    } catch {
      console.error('Failed to load options');
    }
  };

  const fetchDoctors = async (params: Record<string, any>, page = 1) => {
    setLoading(true);
    setError('');
    try {
      const entries = Object.entries({ ...params, page: String(page) })
        .filter(([, v]) => Boolean(v))
        .map(([k, v]) => [k, String(v)]);
      const query = new URLSearchParams(entries).toString();
      const { data } = await api.get(`/doctors/${query ? `?${query}` : ''}`);
      // Handle paginated response
      if (data && 'results' in data) {
        setDoctors(data.results);
        setPagination({ count: data.count, next: data.next, previous: data.previous, current: page });
      } else {
        // Fallback if not paginated
        setDoctors(data);
      }
    } catch {
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      // Depending on whether it's paginated, but backend didn't paginate appointments in the plan
      const { data } = await api.get('/doctors/appointments/');
      setAppointments(data.results || data);
    } catch {
      console.error('Failed to load appointments');
    }
  };

  const [bookingModal, setBookingModal] = useState<{ doctor: Doctor | null, date: string, time: string }>({ doctor: null, date: '', time: '09:00' });
  const [apptModal, setApptModal] = useState<Appointment | null>(null);

  const bookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModal.doctor || !bookingModal.date) return;
    try {
      await api.post('/doctors/appointments/', {
        doctor: bookingModal.doctor.id,
        scheduled_at: `${bookingModal.date}T${bookingModal.time}:00Z`,
        note: 'Requested via dashboard'
      });
      fetchAppointments();
      setBookingModal({ doctor: null, date: '', time: '09:00' });
      alert('Booked successfully!');
    } catch {
      alert('Failed to book.');
    }
  };

  const updateStatus = async (apptId: string, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to mark this as ${newStatus}?`)) return;
    try {
      await api.patch(`/doctors/appointments/${apptId}/status/`, { status: newStatus });
      fetchAppointments();
    } catch {
      alert('Failed to update status.');
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      router.push('/login');
      return;
    }
    fetchOptions();
    fetchDoctors(filters, 1);
    fetchAppointments();
  }, [router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors(filters, 1);
  };

  const handleReset = () => {
    const defaultFilters = { search: '', specialty: '', location: '', gender: '' };
    setFilters(defaultFilters);
    fetchDoctors(defaultFilters, 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-bold text-blue-600">DoctorApp</h1>
          <div className="flex items-center gap-4">
            <Link href="/profile" className="text-sm font-semibold text-gray-600 hover:underline">
              My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
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
            <select
              value={filters.specialty}
              onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Specialties</option>
              {options.specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Locations</option>
              {options.locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
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
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Appointments Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Appointments</h2>
          {appointments.length === 0 ? (
            <p className="text-gray-500">No appointments.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {appointments.map((appt) => (
                <div 
                  key={appt.id} 
                  onClick={() => setApptModal(appt)}
                  className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300"
                >
                  <p className="font-semibold">
                    Doctor: {appt.doctor_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(appt.scheduled_at).toLocaleString()}
                  </p>
                  <p className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                    {appt.status.toUpperCase()}
                  </p>
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
              {doc.image && (
                <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <img src={doc.image} alt={doc.full_name} className="h-full w-full object-cover" />
                </div>
              )}
              <h3 className="font-semibold text-gray-900">{doc.full_name}</h3>
              <p className="mt-1 text-sm text-blue-600">{doc.specialty.name}</p>
              <p className="mt-1 text-sm text-gray-500">{doc.hospital.name}</p>
              <p className="text-sm text-gray-400">{doc.hospital.location}</p>
              {doc.years_of_experience != null && (
                <p className="mt-2 text-xs text-gray-400">{doc.years_of_experience} yrs exp.</p>
              )}
              <button 
                onClick={() => setBookingModal({ doctor: doc, date: '', time: '09:00' })}
                className="mt-4 w-full rounded bg-blue-50 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-100"
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {(pagination.previous || pagination.next) && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              disabled={!pagination.previous}
              onClick={() => fetchDoctors(filters, pagination.current - 1)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {pagination.current}</span>
            <button
              disabled={!pagination.next}
              onClick={() => fetchDoctors(filters, pagination.current + 1)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {bookingModal.doctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Book Appointment</h2>
            <p className="mb-4 text-sm text-gray-600">
              Booking with <span className="font-semibold">{bookingModal.doctor.full_name}</span> at {bookingModal.doctor.hospital.name}.
            </p>
            <form onSubmit={bookAppointment} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
                  value={bookingModal.date}
                  onChange={e => setBookingModal({ ...bookingModal, date: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => {
                    const d = new Date(); d.setDate(d.getDate() + 1);
                    setBookingModal({ ...bookingModal, date: d.toISOString().split('T')[0] })
                  }} className="text-xs text-blue-600 hover:underline">Tomorrow</button>
                  <button type="button" onClick={() => {
                    const d = new Date(); d.setDate(d.getDate() + (6 - d.getDay() + 7) % 7 || 7);
                    setBookingModal({ ...bookingModal, date: d.toISOString().split('T')[0] })
                  }} className="text-xs text-blue-600 hover:underline">Next Weekend</button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Time</label>
                <input
                  type="time"
                  required
                  value={bookingModal.time}
                  onChange={e => setBookingModal({ ...bookingModal, time: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBookingModal({ doctor: null, date: '', time: '09:00' })}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {apptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Appointment Details</h2>
            <div className="space-y-3">
              <p><span className="font-medium text-gray-500">Doctor:</span> {apptModal.doctor_name}</p>
              <p><span className="font-medium text-gray-500">Date/Time:</span> {new Date(apptModal.scheduled_at).toLocaleString()}</p>
              <p>
                <span className="font-medium text-gray-500">Status:</span> 
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">{apptModal.status.toUpperCase()}</span>
              </p>
              {apptModal.note && (
                <p><span className="font-medium text-gray-500">Note:</span> {apptModal.note}</p>
              )}
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setApptModal(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {apptModal.status === 'pending' && (
                <button 
                  onClick={() => { updateStatus(apptModal.id, 'cancelled'); setApptModal(null); }}
                  className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-200"
                >
                  Cancel Appointment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
