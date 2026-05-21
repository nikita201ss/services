from django.db import models
from django.utils.text import slugify
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from transliterate import translit

def validate_file_size(file):
    limit = 10 * 1024 * 1024
    if file.size > limit:
        raise ValidationError(
            f'Размер файла не должен превышать 10 МБ. '
            f'Текущий размер: {file.size / (1024 * 1024):.1f} МБ'
        )

def generate_unique_slug(model_instance, title, slug_field='slug'):
    # Транслитерация кириллицы в латиницу
    slug = translit(title, 'ru', reversed=True)
    slug = slugify(slug)
    
    if not slug:  # Если после транслитерации пусто
        slug = slugify(title)
    
    original_slug = slug
    counter = 1
    while model_instance.__class__.objects.filter(**{slug_field: slug}).exists():
        slug = f"{original_slug}-{counter}"
        counter += 1
    return slug

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    category_image = models.ImageField(
        upload_to='category',
        validators=[validate_file_size]
    )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Category'           
        verbose_name_plural = 'Categories'

class Service(models.Model):
    MODERATION_STATUS_CHOICES = (
        ('pending', 'На модерации'),
        ('approved', 'Опубликовано'),
        ('rejected', 'Отклонено'),
    )
    
    main_image = models.ImageField(
        upload_to='services/main/',
        validators=[validate_file_size]
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="services", null=True, blank=True)
    name = models.CharField(max_length=40)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="services"
    )
    phone_number = models.CharField(max_length=20)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    city = models.CharField(max_length=100, blank=True, verbose_name="Город")
    address = models.CharField(max_length=255, blank=True, verbose_name="Адрес")
    
    moderation_status = models.CharField(max_length=20, choices=MODERATION_STATUS_CHOICES, default='pending')
    moderation_rejection_reason = models.TextField(blank=True, null=True, verbose_name="Причина отклонения")
    moderated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="moderated_services")
    moderated_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug or self.slug == '' or self.slug == '-1':
            self.slug = generate_unique_slug(self, self.name)
        super().save(*args, **kwargs)
class ServiceImage(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(
        upload_to='services/extra/',
        validators=[validate_file_size]
    )



class Request(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Ожидает'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
        ('cancelled', 'Отменено'),
    )
    
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='requests')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_requests')
    executor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_requests')
    
    description = models.TextField()
    meeting_date = models.DateTimeField()
    phone_number = models.CharField(max_length=20)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Заявка от {self.customer.username} на {self.service.name}"