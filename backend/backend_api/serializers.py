from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils.text import slugify
from .models import Category, Service, ServiceImage, Request
from transliterate import translit

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser']
        
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'first_name', 'last_name']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': False},
        }
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "Пароли не совпадают"})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
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
    moderation_status_display = serializers.CharField(source='get_moderation_status_display', read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id', 'name', 'slug', 'main_image', 'main_image_url', 'category', 'category_name', 'category_slug',
            'phone_number', 'price', 'description', 'city', 'address',
            'created_at', 'updated_at', 'images', 'uploaded_images', 'user_info', 'user',
            'moderation_status', 'moderation_status_display', 'moderation_rejection_reason'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'user', 'moderation_status']

    def get_main_image_url(self, obj):
        request = self.context.get('request')
        if obj.main_image and request:
            return request.build_absolute_uri(obj.main_image.url)
        return obj.main_image.url if obj.main_image else None
    
    def generate_unique_slug(self, name):
        slug = translit(name, 'ru', reversed=True)
        slug = slugify(slug)
        
        if not slug:
            slug = slugify(name)
        
        original_slug = slug
        counter = 1
        while Service.objects.filter(slug=slug).exists():
            slug = f"{original_slug}-{counter}"
            counter += 1
        return slug

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        name = validated_data.get('name')
        slug_value = self.generate_unique_slug(name)
        validated_data['slug'] = slug_value
        
        validated_data['moderation_status'] = 'pending'
        
        service = Service.objects.create(**validated_data)
        
        for image in uploaded_images:
            ServiceImage.objects.create(service=service, image=image)
        
        return service
    
    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        if 'name' in validated_data and validated_data['name'] != instance.name:
            validated_data['slug'] = self.generate_unique_slug(validated_data['name'])
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        for image in uploaded_images:
            ServiceImage.objects.create(service=instance, image=image)
        
        return instance
    


class RequestSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    executor_name = serializers.CharField(source='executor.username', read_only=True)
    service_slug = serializers.CharField(source='service.slug', read_only=True)
    
    class Meta:
        model = Request
        fields = [
            'id', 'service', 'service_name', 'service_slug',
            'customer', 'customer_name', 
            'executor', 'executor_name',
            'description', 'meeting_date', 'phone_number',
            'status', 'rejection_reason', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'customer']
    
    def validate_meeting_date(self, value):
        if not value:
            raise serializers.ValidationError("Укажите дату встречи")
        return value
    
    def validate_description(self, value):
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError("Описание должно содержать минимум 5 символов")
        return value
    
class RequestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Request
        fields = ['status', 'rejection_reason']