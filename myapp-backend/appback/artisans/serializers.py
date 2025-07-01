from rest_framework import serializers
from .models import Artisan

class ArtisanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artisan
        fields = '__all__'