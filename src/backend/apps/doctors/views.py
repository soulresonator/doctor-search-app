from rest_framework import generics, permissions, status
from rest_framework.filters import SearchFilter
from rest_framework.response import Response

from .models import Appointment, Doctor
from .serializers import AppointmentSerializer, AppointmentStatusSerializer, DoctorSerializer


class DoctorListView(generics.ListAPIView):
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['full_name', 'specialty__name', 'hospital__location']

    def get_queryset(self):
        qs = Doctor.objects.filter(is_active=True).select_related('specialty', 'hospital')
        specialty = self.request.query_params.get('specialty')
        location = self.request.query_params.get('location')
        gender = self.request.query_params.get('gender')
        if specialty:
            qs = qs.filter(specialty__name__icontains=specialty)
        if location:
            qs = qs.filter(hospital__location__icontains=location)
        if gender:
            qs = qs.filter(gender__iexact=gender)
        return qs


class DoctorDetailView(generics.RetrieveAPIView):
    queryset = Doctor.objects.filter(is_active=True).select_related('specialty', 'hospital', 'clinic_address')
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]


# ── Appointments ──────────────────────────────────────────────────────────────

class AppointmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Doctors see appointments for their profile; patients see their own
        if user.role == 'doctor' and hasattr(user, 'doctor_profile'):
            return Appointment.objects.filter(doctor=user.doctor_profile).select_related('patient', 'doctor')
        return Appointment.objects.filter(patient=user).select_related('patient', 'doctor')


class DoctorOptionsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        specialties = Doctor.objects.filter(is_active=True).values_list('specialty__name', flat=True).distinct()
        locations = Doctor.objects.filter(is_active=True).values_list('hospital__location', flat=True).distinct()
        return Response({
            'specialties': sorted(list(specialties)),
            'locations': sorted(list(locations)),
        })


class AppointmentStatusView(generics.UpdateAPIView):
    """Doctor confirms/cancels, patient can only cancel."""
    serializer_class = AppointmentStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['patch']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'doctor' and hasattr(user, 'doctor_profile'):
            return Appointment.objects.filter(doctor=user.doctor_profile)
        return Appointment.objects.filter(patient=user)

    def patch(self, request, *args, **kwargs):
        appt = self.get_object()
        new_status = request.data.get('status')
        user = request.user
        
        is_doctor = user.role == 'doctor' and hasattr(user, 'doctor_profile') and appt.doctor == user.doctor_profile
        is_patient = appt.patient == user

        if new_status == Appointment.STATUS_CANCELLED:
            pass # Both can cancel
        elif new_status == Appointment.STATUS_CONFIRMED and is_doctor:
            pass # Only doctor can confirm
        else:
            return Response({'detail': 'Invalid status or permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        appt.status = new_status
        appt.save(update_fields=['status', 'updated_at'])
        return Response(AppointmentSerializer(appt).data)
