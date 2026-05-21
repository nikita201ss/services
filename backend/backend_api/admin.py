from django.contrib import admin
from .models import Category, Service, ServiceImage, Request

class ServiceImageInline(admin.TabularInline):
    model = ServiceImage
    extra = 1

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'city', 'created_at', 'moderation_status']
    list_filter = ['category', 'city', 'created_at', 'moderation_status']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ServiceImageInline]

@admin.register(ServiceImage)
class ServiceImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'service']

@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'service', 'customer', 'executor', 'meeting_date', 'status']
    list_filter = ['status', 'created_at']
    search_fields = ['service__name', 'customer__username', 'executor__username']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Информация о заявке', {
            'fields': ('service', 'customer', 'executor', 'description', 'meeting_date', 'phone_number')
        }),
        ('Статус', {
            'fields': ('status', 'rejection_reason')
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at')
        }),
    )