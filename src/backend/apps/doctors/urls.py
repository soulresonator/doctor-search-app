from django.urls import path

from .views import AppointmentListCreateView, AppointmentStatusView, DoctorDetailView, DoctorListView

urlpatterns = [
    path('', DoctorListView.as_view(), name='doctor-list'),
    path('<uuid:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),
    path('appointments/', AppointmentListCreateView.as_view(), name='appointment-list'),
    path('appointments/<uuid:pk>/status/', AppointmentStatusView.as_view(), name='appointment-status'),
]
