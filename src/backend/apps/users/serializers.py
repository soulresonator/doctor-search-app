from rest_framework import serializers

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(required=True)
    phone_number = serializers.RegexField(regex=r'^\+?[0-9]{7,15}$', required=True)
    age = serializers.IntegerField(required=True, min_value=1, max_value=120)
    gender = serializers.CharField(required=True)
    occupation = serializers.CharField(required=True)

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
        fields = ('id', 'username', 'full_name', 'avatar', 'phone_number', 'age', 'gender', 'occupation', 'role')
        read_only_fields = ('id', 'role', 'username')
