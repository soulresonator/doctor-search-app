from django.core.management.base import BaseCommand

from apps.doctors.models import ClinicAddress, Doctor, Hospital, Specialty

SPECIALTIES = [
    'Cardiology', 'Neurology', 'Pediatrics', 'Dermatology',
    'Orthopedics', 'Oncology', 'General Practice',
]

HOSPITALS = [
    ('Bach Mai Hospital', 'Hanoi'),
    ('Viet Duc Hospital', 'Hanoi'),
    ('Cho Ray Hospital', 'HCMC'),
    ('Binh Dan Hospital', 'HCMC'),
    ('Da Nang Hospital', 'Da Nang'),
]

DOCTORS = [
    ('Dr. Nguyen Van A', 'Cardiology', 'Bach Mai Hospital', 'Male', 15),
    ('Dr. Tran Thi B', 'Neurology', 'Viet Duc Hospital', 'Female', 10),
    ('Dr. Le Van C', 'Pediatrics', 'Cho Ray Hospital', 'Male', 8),
    ('Dr. Pham Thi D', 'Dermatology', 'Binh Dan Hospital', 'Female', 12),
    ('Dr. Hoang Van E', 'Orthopedics', 'Da Nang Hospital', 'Male', 20),
    ('Dr. Vo Thi F', 'Oncology', 'Bach Mai Hospital', 'Female', 18),
    ('Dr. Dang Van G', 'General Practice', 'Cho Ray Hospital', 'Male', 5),
]


class Command(BaseCommand):
    help = 'Seed the database with sample specialties, hospitals, and doctors'

    def handle(self, *args, **options):
        # Specialties
        specialties = {
            name: Specialty.objects.get_or_create(name=name)[0]
            for name in SPECIALTIES
        }
        self.stdout.write(f'  Seeded {len(specialties)} specialties')

        # Hospitals
        hospitals = {
            name: Hospital.objects.get_or_create(name=name, defaults={'location': loc})[0]
            for name, loc in HOSPITALS
        }
        self.stdout.write(f'  Seeded {len(hospitals)} hospitals')

        # Doctors
        created = 0
        for full_name, spec_name, hosp_name, gender, exp in DOCTORS:
            _, is_new = Doctor.objects.get_or_create(
                full_name=full_name,
                defaults={
                    'specialty': specialties[spec_name],
                    'hospital': hospitals[hosp_name],
                    'gender': gender,
                    'years_of_experience': exp,
                },
            )
            if is_new:
                created += 1
        self.stdout.write(f'  Seeded {created} new doctors')
        self.stdout.write(self.style.SUCCESS('Seed complete.'))
