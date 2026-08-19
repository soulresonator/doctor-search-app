from rest_framework import serializers

from .models import Doctor, Specialty, Hospital


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
            'specialty', 'hospital', 'is_active',
        )
