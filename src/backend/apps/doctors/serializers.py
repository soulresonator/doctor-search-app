from rest_framework import serializers

from .models import Appointment, Doctor, Hospital, Specialty


class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ('id', 'name')


class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = ('id', 'name', 'location')


class DoctorSerializer(serializers.ModelSerializer):
    specialty = SpecialtySerializer(read_only=True)
    hospital = HospitalSerializer(read_only=True)

    class Meta:
        model = Doctor
        fields = (
            'id', 'full_name', 'gender', 'years_of_experience',
            'specialty', 'hospital', 'phone_number', 'email', 'is_active',
        )


class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)

    class Meta:
        model = Appointment
        fields = ('id', 'doctor', 'doctor_name', 'patient', 'patient_name',
                  'scheduled_at', 'status', 'note', 'created_at')
        read_only_fields = ('id', 'patient', 'status', 'created_at')

    def create(self, validated_data):
        validated_data['patient'] = self.context['request'].user
        return super().create(validated_data)


class AppointmentStatusSerializer(serializers.ModelSerializer):
    """Doctor-only: update status."""
    class Meta:
        model = Appointment
        fields = ('status',)
