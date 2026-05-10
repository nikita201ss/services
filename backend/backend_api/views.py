from rest_framework import generics, permissions
from django.contrib.auth.models import User
from django.db.models import Q
from .models import Category, Service, Request
from .serializers import (
    CategorySerializer, ServiceSerializer, 
    UserSerializer, RegisterSerializer, RequestUpdateSerializer, RequestSerializer
)
from rest_framework.response import Response

class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    
    def get_serializer_context(self):
        return {'request': self.request}

class ServiceListAPIView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def get_queryset(self):
        queryset = Service.objects.all().order_by('-created_at')
        
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        query = self.request.query_params.get('q')
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) | Q(description__icontains=query)
            )
        
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        return queryset

class ServiceDetailAPIView(generics.RetrieveAPIView):
    queryset = Service.objects.prefetch_related('images')
    serializer_class = ServiceSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]
    
    def get_serializer_context(self):
        return {'request': self.request}

class ServiceCreateAPIView(generics.CreateAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserServiceListAPIView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Service.objects.filter(user=self.request.user)

class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def create(self, request, *args, **kwargs):
        print("Register endpoint called")
        print("Request data:", request.data)
        return super().create(request, *args, **kwargs)
    

class UserProfileAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
class UserRequestsAPIView(generics.ListAPIView):
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Request.objects.filter(executor=user) | Request.objects.filter(customer=user)


class RequestCreateAPIView(generics.CreateAPIView):
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

class ReceivedRequestsAPIView(generics.ListAPIView):
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Request.objects.filter(executor=self.request.user).order_by('-created_at')

class SentRequestsAPIView(generics.ListAPIView):
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Request.objects.filter(customer=self.request.user).order_by('-created_at')

class UpdateRequestStatusAPIView(generics.UpdateAPIView):
    serializer_class = RequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Request.objects.all()
    lookup_field = 'pk'
    
    def update(self, request, *args, **kwargs):
        print("=== UPDATE REQUEST ===")
        print("Request ID:", kwargs.get('pk'))
        print("Data:", request.data)
        
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        print("Updated status to:", serializer.instance.status)
        
        return Response(serializer.data)
    
    def perform_update(self, serializer):
        serializer.save()