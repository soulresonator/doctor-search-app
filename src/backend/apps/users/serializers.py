from rest_framework import serializers

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            'username', 'password', 'full_name', 'phone_number',
            'age', 'gender', 'occupation',
        )

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'phone_number', 'age', 'gender', 'occupation', 'role')
        read_only_fields = ('id', 'role')
