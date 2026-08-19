from rest_framework import generics, permissions
from rest_framework.filters import SearchFilter

from .models import Doctor
from .serializers import DoctorSerializer


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
