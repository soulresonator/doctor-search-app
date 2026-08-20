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
    print("4. Run Development Server")
    print("5. Run Tests")
    print("6. Run Tests (verbose)")
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
            print("\nPress Ctrl+C to stop the server.")
            run_command("python manage.py runserver", wait=False)
        elif choice == "5":
            run_command("pytest")
        elif choice == "6":
            run_command("pytest -v")
        elif choice == "0":
            print("\nGoodbye! 👋")
            break
        else:
            print("\nInvalid choice. Please try again.")

if __name__ == "__main__":
    main()
