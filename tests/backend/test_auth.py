import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.users.models import User


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def register_payload():
    return {
        'username': 'testuser',
        'password': 'securepass123',
        'full_name': 'Test User',
        'phone_number': '0123456789',
        'age': 30,
        'gender': 'Male',
        'occupation': 'Engineer',
    }


# ── Registration ──────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_register_success(client, register_payload):
    url = reverse('auth-register')
    resp = client.post(url, register_payload, format='json')
    assert resp.status_code == 201
    assert User.objects.filter(username='testuser').exists()


@pytest.mark.django_db
def test_register_duplicate_username(client, register_payload):
    url = reverse('auth-register')
    client.post(url, register_payload, format='json')
    resp = client.post(url, register_payload, format='json')
    assert resp.status_code == 400


@pytest.mark.django_db
def test_register_missing_required_field(client, register_payload):
    url = reverse('auth-register')
    del register_payload['phone_number']
    resp = client.post(url, register_payload, format='json')
    assert resp.status_code == 400


@pytest.mark.django_db
def test_register_missing_age(client, register_payload):
    url = reverse('auth-register')
    del register_payload['age']
    resp = client.post(url, register_payload, format='json')
    assert resp.status_code == 400


@pytest.mark.django_db
def test_register_missing_gender(client, register_payload):
    url = reverse('auth-register')
    del register_payload['gender']
    resp = client.post(url, register_payload, format='json')
    assert resp.status_code == 400


@pytest.mark.django_db
def test_register_password_not_in_response(client, register_payload):
    url = reverse('auth-register')
    resp = client.post(url, register_payload, format='json')
    assert 'password' not in resp.data


# ── Login ─────────────────────────────────────────────────────────────────────

@pytest.fixture
def registered_user(register_payload):
    return User.objects.create_user(**register_payload)


@pytest.mark.django_db
def test_login_success(client, registered_user):
    url = reverse('auth-login')
    resp = client.post(url, {'username': 'testuser', 'password': 'securepass123'}, format='json')
    assert resp.status_code == 200
    assert 'access' in resp.data
    assert 'refresh' in resp.data


@pytest.mark.django_db
def test_login_wrong_password(client, registered_user):
    url = reverse('auth-login')
    resp = client.post(url, {'username': 'testuser', 'password': 'wrongpassword'}, format='json')
    assert resp.status_code == 401


@pytest.mark.django_db
def test_login_unknown_user(client):
    url = reverse('auth-login')
    resp = client.post(url, {'username': 'nobody', 'password': 'x'}, format='json')
    assert resp.status_code == 401


# ── /me ───────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_me_returns_current_user(client, registered_user):
    login_resp = client.post(
        reverse('auth-login'),
        {'username': 'testuser', 'password': 'securepass123'},
        format='json',
    )
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_resp.data['access']}")
    resp = client.get(reverse('auth-me'))
    assert resp.status_code == 200
    assert resp.data['username'] == 'testuser'


@pytest.mark.django_db
def test_me_unauthenticated(client):
    resp = client.get(reverse('auth-me'))
    assert resp.status_code == 401
