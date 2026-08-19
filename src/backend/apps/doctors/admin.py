from django.contrib import admin

from .models import Appointment, ClinicAddress, Doctor, Hospital, Specialty


@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'created_at')
    search_fields = ('name', 'location')
    list_filter = ('location',)


@admin.register(ClinicAddress)
class ClinicAddressAdmin(admin.ModelAdmin):
    list_display = ('address_line', 'city', 'created_at')
    search_fields = ('address_line', 'city')


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'specialty', 'hospital', 'gender', 'is_active', 'created_at')
    list_filter = ('specialty', 'hospital', 'gender', 'is_active')
    search_fields = ('full_name',)
    list_editable = ('is_active',)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'scheduled_at', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('patient__username', 'doctor__full_name')
