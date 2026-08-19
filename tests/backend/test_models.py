import pytest
from django.db import IntegrityError
from django.db.models import ProtectedError

from apps.users.models import User
from apps.doctors.models import Specialty, Hospital, ClinicAddress, Doctor


# ── helpers ───────────────────────────────────────────────────────────────────

def make_user(**kwargs):
    defaults = dict(
        username='testuser', password='pass', full_name='Test User',
        phone_number='0123456789', age=30, gender='Male', occupation='Engineer',
    )
    defaults.update(kwargs)
    return User.objects.create_user(**defaults)


def make_specialty(**kwargs):
    return Specialty.objects.create(name=kwargs.get('name', 'Cardiology'))


def make_hospital(**kwargs):
    return Hospital.objects.create(
        name=kwargs.get('name', 'City Hospital'),
        location=kwargs.get('location', 'Hanoi'),
    )


def make_doctor(**kwargs):
    s = kwargs.pop('specialty', None) or make_specialty()
    h = kwargs.pop('hospital', None) or make_hospital()
    return Doctor.objects.create(full_name='Dr. Test', specialty=s, hospital=h, **kwargs)


# ── User ──────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_create_user():
    u = make_user()
    assert u.pk is not None


@pytest.mark.django_db
def test_user_username_unique():
    make_user(username='dup')
    with pytest.raises(IntegrityError):
        make_user(username='dup')


@pytest.mark.django_db
def test_user_str_representation():
    u = make_user(username='alice')
    assert str(u) == 'alice'


@pytest.mark.django_db
def test_user_default_role():
    u = make_user()
    assert u.role == User.ROLE_USER


@pytest.mark.django_db
def test_user_default_is_active():
    u = make_user()
    assert u.is_active is True


@pytest.mark.django_db
def test_user_uuid_primary_key():
    u = make_user()
    assert isinstance(str(u.pk), str) and len(str(u.pk)) == 36  # UUID format


# ── Specialty ─────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_create_specialty():
    s = make_specialty(name='Neurology')
    assert s.pk is not None


@pytest.mark.django_db
def test_specialty_name_unique():
    make_specialty(name='Dermatology')
    with pytest.raises(IntegrityError):
        make_specialty(name='Dermatology')


@pytest.mark.django_db
def test_specialty_str():
    s = make_specialty(name='Pediatrics')
    assert str(s) == 'Pediatrics'


# ── Hospital ──────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_create_hospital():
    h = make_hospital(name='General Hospital', location='HCMC')
    assert h.pk is not None


@pytest.mark.django_db
def test_hospital_name_unique():
    make_hospital(name='Unique Hospital')
    with pytest.raises(IntegrityError):
        make_hospital(name='Unique Hospital')


@pytest.mark.django_db
def test_hospital_str():
    h = make_hospital(name='Royal Hospital')
    assert str(h) == 'Royal Hospital'


# ── ClinicAddress ─────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_create_clinic_address():
    a = ClinicAddress.objects.create(address_line='123 Main St', city='Hanoi')
    assert a.pk is not None


@pytest.mark.django_db
def test_clinic_address_str():
    a = ClinicAddress.objects.create(address_line='456 Oak Ave', city='HCMC')
    assert '456 Oak Ave' in str(a) and 'HCMC' in str(a)


# ── Doctor ────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_create_doctor():
    d = make_doctor()
    assert d.pk is not None


@pytest.mark.django_db
def test_doctor_specialty_relationship():
    s = make_specialty(name='Oncology')
    d = make_doctor(specialty=s)
    assert d.specialty == s


@pytest.mark.django_db
def test_doctor_hospital_relationship():
    h = make_hospital(name='Cancer Center', location='Hanoi')
    d = make_doctor(hospital=h)
    assert d.hospital == h


@pytest.mark.django_db
def test_doctor_clinic_address_optional():
    d = make_doctor()
    assert d.clinic_address is None


@pytest.mark.django_db
def test_doctor_soft_delete():
    d = make_doctor()
    d.is_active = False
    d.save()
    assert Doctor.objects.filter(is_active=True, pk=d.pk).count() == 0


@pytest.mark.django_db
def test_doctor_str():
    d = make_doctor()
    assert str(d) == 'Dr. Test'


@pytest.mark.django_db
def test_delete_specialty_with_doctor_prevented():
    s = make_specialty(name='ENT')
    make_doctor(specialty=s)
    with pytest.raises(ProtectedError):
        s.delete()


@pytest.mark.django_db
def test_delete_hospital_with_doctor_prevented():
    h = make_hospital(name='Eye Clinic', location='Danang')
    make_doctor(hospital=h)
    with pytest.raises(ProtectedError):
        h.delete()
