import pytest
from django.contrib.admin.sites import site
from django.core.management import call_command

from apps.users.models import User
from apps.doctors.models import Specialty, Hospital, Doctor


# ── Admin registration ────────────────────────────────────────────────────────

def test_user_registered_in_admin():
    assert site.is_registered(User)


def test_specialty_registered_in_admin():
    from apps.doctors.models import Specialty
    assert site.is_registered(Specialty)


def test_hospital_registered_in_admin():
    from apps.doctors.models import Hospital
    assert site.is_registered(Hospital)


def test_doctor_registered_in_admin():
    assert site.is_registered(Doctor)


# ── seed_data command ─────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_seed_creates_specialties():
    call_command('seed_data', verbosity=0)
    assert Specialty.objects.count() >= 7


@pytest.mark.django_db
def test_seed_creates_hospitals():
    call_command('seed_data', verbosity=0)
    assert Hospital.objects.count() >= 5


@pytest.mark.django_db
def test_seed_creates_doctors():
    call_command('seed_data', verbosity=0)
    assert Doctor.objects.count() >= 7


@pytest.mark.django_db
def test_seed_is_idempotent():
    call_command('seed_data', verbosity=0)
    count_after_first = Doctor.objects.count()
    call_command('seed_data', verbosity=0)
    assert Doctor.objects.count() == count_after_first
