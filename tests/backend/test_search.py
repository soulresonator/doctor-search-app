import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.users.models import User
from apps.doctors.models import Doctor, Specialty, Hospital


@pytest.fixture
def auth_client():
    user = User.objects.create_user(
        username='searcher', password='pass12345', full_name='Searcher',
        phone_number='000', age=25, gender='Female', occupation='Nurse',
    )
    client = APIClient()
    resp = client.post(reverse('auth-login'), {'username': 'searcher', 'password': 'pass12345'}, format='json')
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
    return client


@pytest.fixture
def db_data(db):
    cardio = Specialty.objects.create(name='Cardiology')
    neuro = Specialty.objects.create(name='Neurology')
    hosp_hn = Hospital.objects.create(name='Hanoi Hospital', location='Hanoi')
    hosp_hcm = Hospital.objects.create(name='HCMC Hospital', location='HCMC')
    Doctor.objects.create(full_name='Dr. Alice', specialty=cardio, hospital=hosp_hn, gender='Female')
    Doctor.objects.create(full_name='Dr. Bob', specialty=neuro, hospital=hosp_hcm, gender='Male')
    Doctor.objects.create(full_name='Dr. Carol', specialty=cardio, hospital=hosp_hn, gender='Female', is_active=False)
    return {'cardio': cardio, 'neuro': neuro, 'hosp_hn': hosp_hn, 'hosp_hcm': hosp_hcm}


# ── Doctor list ───────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_doctor_list_requires_auth():
    resp = APIClient().get(reverse('doctor-list'))
    assert resp.status_code == 401


@pytest.mark.django_db
def test_doctor_list_returns_active_only(auth_client, db_data):
    resp = auth_client.get(reverse('doctor-list'))
    assert resp.status_code == 200
    names = [d['full_name'] for d in resp.data['results']]
    assert 'Dr. Alice' in names
    assert 'Dr. Bob' in names
    assert 'Dr. Carol' not in names  # inactive


@pytest.mark.django_db
def test_doctor_filter_by_specialty(auth_client, db_data):
    resp = auth_client.get(reverse('doctor-list'), {'specialty': 'Cardiology'})
    assert resp.status_code == 200
    assert all('Cardiology' in d['specialty']['name'] for d in resp.data['results'])


@pytest.mark.django_db
def test_doctor_filter_by_location(auth_client, db_data):
    resp = auth_client.get(reverse('doctor-list'), {'location': 'Hanoi'})
    assert resp.status_code == 200
    assert all('Hanoi' in d['hospital']['location'] for d in resp.data['results'])


@pytest.mark.django_db
def test_doctor_filter_by_gender(auth_client, db_data):
    resp = auth_client.get(reverse('doctor-list'), {'gender': 'Male'})
    assert resp.status_code == 200
    assert all(d['gender'] == 'Male' for d in resp.data['results'])


@pytest.mark.django_db
def test_doctor_search_by_name(auth_client, db_data):
    resp = auth_client.get(reverse('doctor-list'), {'search': 'Alice'})
    assert resp.status_code == 200
    assert len(resp.data['results']) == 1
    assert resp.data['results'][0]['full_name'] == 'Dr. Alice'


@pytest.mark.django_db
def test_doctor_empty_results(auth_client, db_data):
    resp = auth_client.get(reverse('doctor-list'), {'specialty': 'Dermatology'})
    assert resp.status_code == 200
    assert len(resp.data['results']) == 0


@pytest.mark.django_db
def test_doctor_list_is_paginated(auth_client, db_data):
    resp = auth_client.get(reverse('doctor-list'))
    assert resp.status_code == 200
    assert 'count' in resp.data
    assert 'next' in resp.data
    assert 'previous' in resp.data
    assert 'results' in resp.data


@pytest.mark.django_db
def test_doctor_options(auth_client, db_data):
    resp = auth_client.get(reverse('doctor-options'))
    assert resp.status_code == 200
    assert 'specialties' in resp.data
    assert 'locations' in resp.data
    assert 'Cardiology' in resp.data['specialties']
    assert 'Neurology' in resp.data['specialties']
    assert 'Hanoi' in resp.data['locations']
    assert 'HCMC' in resp.data['locations']


# ── Doctor detail ─────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_doctor_detail_success(auth_client, db_data):
    doctor = Doctor.objects.filter(is_active=True).first()
    resp = auth_client.get(reverse('doctor-detail', kwargs={'pk': doctor.pk}))
    assert resp.status_code == 200
    assert resp.data['id'] == str(doctor.pk)


@pytest.mark.django_db
def test_doctor_detail_inactive_returns_404(auth_client, db_data):
    inactive = Doctor.objects.filter(is_active=False).first()
    resp = auth_client.get(reverse('doctor-detail', kwargs={'pk': inactive.pk}))
    assert resp.status_code == 404
