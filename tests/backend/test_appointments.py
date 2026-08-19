import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.users.models import User
from apps.doctors.models import Appointment, Doctor, Hospital, Specialty


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def patient(db):
    return User.objects.create_user(
        username='patient1', password='pass12345', full_name='Patient One',
        phone_number='111', age=30, gender='Male', occupation='Engineer',
    )


@pytest.fixture
def doctor_user(db):
    return User.objects.create_user(
        username='drsmith', password='pass12345', full_name='Dr Smith',
        phone_number='222', age=40, gender='Male', occupation='Doctor',
        role=User.ROLE_DOCTOR,
    )


@pytest.fixture
def doctor_profile(db, doctor_user):
    specialty = Specialty.objects.create(name='Surgery')
    hospital = Hospital.objects.create(name='City Hospital', location='Hanoi')
    return Doctor.objects.create(
        user=doctor_user,
        full_name='Dr Smith',
        specialty=specialty,
        hospital=hospital,
    )


@pytest.fixture
def patient_client(patient):
    c = APIClient()
    resp = c.post(reverse('auth-login'), {'username': 'patient1', 'password': 'pass12345'}, format='json')
    c.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
    return c


@pytest.fixture
def doctor_client(doctor_user):
    c = APIClient()
    resp = c.post(reverse('auth-login'), {'username': 'drsmith', 'password': 'pass12345'}, format='json')
    c.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
    return c


# ── Role model ────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_doctor_role_not_overwritten_by_save(doctor_user):
    doctor_user.save()
    assert doctor_user.role == User.ROLE_DOCTOR


@pytest.mark.django_db
def test_superuser_gets_admin_role():
    su = User.objects.create_superuser(username='admin2', password='pass12345', email='')
    assert su.role == User.ROLE_ADMIN


@pytest.mark.django_db
def test_doctor_profile_linked_to_user(doctor_profile, doctor_user):
    assert doctor_user.doctor_profile == doctor_profile


# ── Appointments: patient books ───────────────────────────────────────────────

@pytest.mark.django_db
def test_patient_can_book_appointment(patient_client, doctor_profile):
    resp = patient_client.post(reverse('appointment-list'), {
        'doctor': str(doctor_profile.pk),
        'scheduled_at': '2030-01-15T10:00:00Z',
        'note': 'First visit',
    }, format='json')
    assert resp.status_code == 201
    assert resp.data['status'] == 'pending'


@pytest.mark.django_db
def test_appointment_patient_set_from_token(patient_client, patient, doctor_profile):
    patient_client.post(reverse('appointment-list'), {
        'doctor': str(doctor_profile.pk),
        'scheduled_at': '2030-01-15T10:00:00Z',
    }, format='json')
    appt = Appointment.objects.first()
    assert appt.patient == patient


@pytest.mark.django_db
def test_patient_sees_own_appointments(patient_client, patient, doctor_profile):
    Appointment.objects.create(patient=patient, doctor=doctor_profile, scheduled_at='2030-01-15T10:00:00Z')
    resp = patient_client.get(reverse('appointment-list'))
    assert resp.status_code == 200
    assert len(resp.data) == 1


# ── Appointments: doctor manages ─────────────────────────────────────────────

@pytest.mark.django_db
def test_doctor_sees_their_appointments(doctor_client, doctor_profile, patient):
    Appointment.objects.create(patient=patient, doctor=doctor_profile, scheduled_at='2030-01-15T10:00:00Z')
    resp = doctor_client.get(reverse('appointment-list'))
    assert resp.status_code == 200
    assert len(resp.data) == 1


@pytest.mark.django_db
def test_doctor_confirms_appointment(doctor_client, doctor_profile, patient):
    appt = Appointment.objects.create(patient=patient, doctor=doctor_profile, scheduled_at='2030-01-15T10:00:00Z')
    resp = doctor_client.patch(
        reverse('appointment-status', kwargs={'pk': appt.pk}),
        {'status': 'confirmed'}, format='json',
    )
    assert resp.status_code == 200
    assert resp.data['status'] == 'confirmed'


@pytest.mark.django_db
def test_doctor_cancels_appointment(doctor_client, doctor_profile, patient):
    appt = Appointment.objects.create(patient=patient, doctor=doctor_profile, scheduled_at='2030-01-15T10:00:00Z')
    resp = doctor_client.patch(
        reverse('appointment-status', kwargs={'pk': appt.pk}),
        {'status': 'cancelled'}, format='json',
    )
    assert resp.status_code == 200
    assert resp.data['status'] == 'cancelled'


@pytest.mark.django_db
def test_doctor_cannot_set_invalid_status(doctor_client, doctor_profile, patient):
    appt = Appointment.objects.create(patient=patient, doctor=doctor_profile, scheduled_at='2030-01-15T10:00:00Z')
    resp = doctor_client.patch(
        reverse('appointment-status', kwargs={'pk': appt.pk}),
        {'status': 'approved'}, format='json',
    )
    assert resp.status_code == 400


@pytest.mark.django_db
def test_patient_cannot_update_appointment_status(patient_client, doctor_profile, patient):
    appt = Appointment.objects.create(patient=patient, doctor=doctor_profile, scheduled_at='2030-01-15T10:00:00Z')
    resp = patient_client.patch(
        reverse('appointment-status', kwargs={'pk': appt.pk}),
        {'status': 'confirmed'}, format='json',
    )
    assert resp.status_code == 404  # get_queryset returns none for non-doctors


@pytest.mark.django_db
def test_unauthenticated_cannot_book(doctor_profile):
    resp = APIClient().post(reverse('appointment-list'), {
        'doctor': str(doctor_profile.pk),
        'scheduled_at': '2030-01-15T10:00:00Z',
    }, format='json')
    assert resp.status_code == 401
