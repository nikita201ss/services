from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Service, ServiceImage

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Пароли не совпадают")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class ServiceImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceImage
        fields = ['id', 'image', 'image_url']
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None

class CategorySerializer(serializers.ModelSerializer):
    services_count = serializers.IntegerField(source='services.count', read_only=True)
    category_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'category_image', 'category_image_url', 'services_count']
    
    def get_category_image_url(self, obj):
        request = self.context.get('request')
        if obj.category_image and request:
            return request.build_absolute_uri(obj.category_image.url)
        return obj.category_image.url if obj.category_image else None

class ServiceSerializer(serializers.ModelSerializer):
    images = ServiceImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    user_info = UserSerializer(source='user', read_only=True)
    main_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Service
        fields = [
            'id', 'name', 'slug', 'main_image', 'main_image_url', 'category', 'category_name', 'category_slug',
            'phone_number', 'price', 'description', 'city', 'address',
            'created_at', 'updated_at', 'images', 'uploaded_images', 'user_info', 'user'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'user']
    
    def get_main_image_url(self, obj):
        request = self.context.get('request')
        if obj.main_image and request:
            return request.build_absolute_uri(obj.main_image.url)
        return obj.main_image.url if obj.main_image else None
    
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        service = Service.objects.create(**validated_data)
        
        for image in uploaded_images:
            ServiceImage.objects.create(service=service, image=image)
        
        return service
    
    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        for image in uploaded_images:
            ServiceImage.objects.create(service=instance, image=image)
        
        return instance