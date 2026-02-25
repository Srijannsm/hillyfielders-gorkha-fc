from django.shortcuts import render
from rest_framework import viewsets
from .models import TrainingSession
from .serializers import TrainingSessionSerializer

class TrainingSessionViewSet(viewsets.ModelViewSet):
    queryset = TrainingSession.objects.all()
    serializer_class = TrainingSessionSerializer
