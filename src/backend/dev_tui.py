#!/usr/bin/env python3
import os
import subprocess
import sys

def print_menu():
    print("\n" + "="*40)
    print(" 🏥 DoctorApp Backend Dev Menu")
    print("="*40)
    print("1. Make Migrations")
    print("2. Migrate")
    print("3. Create Superuser")
    print("4. Seed Test Data (Creates a Doctor)")
    print("5. Run Development Server")
    print("6. Run Tests")
    print("7. Run Tests (verbose)")
    print("8. Reset Database (Drop all and migrate)")
    print("9. Reset Database and Seed Mock Data")
    print("0. Exit")
    print("="*40)

def run_command(cmd, wait=True):
    print(f"\n> Running: {cmd}")
    try:
        if wait:
            subprocess.run(cmd, shell=True, check=True)
        else:
            subprocess.run(cmd, shell=True)
    except subprocess.CalledProcessError:
        print("\n❌ Command failed.")
    print("\n" + "-"*40)

def main():
    # Ensure we run from the backend directory where manage.py is
    if not os.path.exists("manage.py"):
        print("Error: Please run this script from the src/backend directory.")
        sys.exit(1)

    while True:
        print_menu()
        choice = input("Select an option: ").strip()

        if choice == "1":
            run_command("python manage.py makemigrations")
        elif choice == "2":
            run_command("python manage.py migrate")
        elif choice == "3":
            run_command("python manage.py createsuperuser")
        elif choice == "4":
            print("\nGenerating seed data (creating test doctor)...")
            script = """
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
from apps.doctors.models import Doctor, Specialty, Hospital

specialty, _ = Specialty.objects.get_or_create(name='Cardiology', defaults={'description':'Heart specialist'})
hospital, _ = Hospital.objects.get_or_create(name='General Hospital', defaults={'location':'New York'})

doc, doc_created = Doctor.objects.get_or_create(full_name='Dr. Jane Smith', defaults={
    'specialty': specialty,
    'hospital': hospital,
    'years_of_experience': 15,
})

print(f"\\n✅ Doctor entity ready!")
"""
            with open('.seed.py', 'w') as f:
                f.write(script.strip())
            run_command("python .seed.py")
            os.remove('.seed.py')
        elif choice == "5":
            print("\nPress Ctrl+C to stop the server.")
            run_command("python manage.py runserver", wait=False)
        elif choice == "6":
            run_command("pytest")
        elif choice == "7":
            run_command("pytest -v")
        elif choice == "8":
            print("\nResetting Database...")
            if os.path.exists("db.sqlite3"):
                os.remove("db.sqlite3")
            run_command("python manage.py migrate")
        elif choice == "9":
            print("\nResetting Database and Seeding Mock Data...")
            if os.path.exists("db.sqlite3"):
                os.remove("db.sqlite3")
            run_command("python manage.py migrate")
            
            script = """
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
from apps.doctors.models import Doctor, Specialty, Hospital

specialty, _ = Specialty.objects.get_or_create(name='Neurology', defaults={'description':'Brain specialist'})
hospital, _ = Hospital.objects.get_or_create(name='City Hospital', defaults={'location':'San Francisco'})

Doctor.objects.create(full_name='Dr. John Doe', specialty=specialty, hospital=hospital, years_of_experience=10)
Doctor.objects.create(full_name='Dr. Alice Wonderland', specialty=specialty, hospital=hospital, years_of_experience=5)

print(f"\\n✅ Mock Data Seeded!")
"""
            with open('.seed.py', 'w') as f:
                f.write(script.strip())
            run_command("python .seed.py")
            os.remove('.seed.py')
        elif choice == "0":
            print("\nGoodbye! 👋")
            break
        else:
            print("\nInvalid choice. Please try again.")

if __name__ == "__main__":
    main()
