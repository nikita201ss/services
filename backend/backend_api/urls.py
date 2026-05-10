from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

app_name = 'api'

urlpatterns = [
    path('categories/', views.CategoryListAPIView.as_view(), name='categories'),
    
    path('services/', views.ServiceListAPIView.as_view(), name='services'),
    path('services/create/', views.ServiceCreateAPIView.as_view(), name='service-create'),
    path('services/<slug:slug>/', views.ServiceDetailAPIView.as_view(), name='service-detail'),
    path('my-services/', views.UserServiceListAPIView.as_view(), name='my-services'),
    
    path('auth/register/', views.RegisterAPIView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.UserProfileAPIView.as_view(), name='profile'),

    path('requests/create/', views.RequestCreateAPIView.as_view(), name='request-create'),
    path('requests/received/', views.ReceivedRequestsAPIView.as_view(), name='requests-received'),
    path('requests/sent/', views.SentRequestsAPIView.as_view(), name='requests-sent'),
    path('requests/<int:pk>/update/', views.UpdateRequestStatusAPIView.as_view(), name='request-update'),
]