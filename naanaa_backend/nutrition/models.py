from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class HealthProfile(models.Model):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
    )
    ACTIVITY_LEVEL_CHOICES = (
        (1.2, 'Sedentary (1.2)'),
        (1.4, 'Lightly active (1.4)'),
        (1.6, 'Moderately active (1.6)'),
    )
    GOAL_CHOICES = (
        ('Lose', 'Lose Weight'),
        ('Maintain', 'Maintain Weight'),
        ('Gain', 'Gain Weight'),
    )

    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    weight = models.FloatField()
    target_weight = models.FloatField(null=True, blank=True)
    height = models.FloatField()
    age = models.IntegerField()
    activity_level = models.FloatField(choices=ACTIVITY_LEVEL_CHOICES)
    goal = models.CharField(max_length=10, choices=GOAL_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"HealthProfile for {self.gender}, Age {self.age}"



class HealthCheck(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="health_checks")
    current_weight = models.FloatField()
    target_weight = models.FloatField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    activity_level = models.FloatField(null=True, blank=True)
    goal = models.CharField(max_length=15, null=True, blank=True)
    calories = models.FloatField()
    bmi = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.created_at.strftime('%Y-%m-%d')}"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', default='default.png')
    bio = models.TextField(blank=True)
    
    is_chef = models.BooleanField(default=False)
    is_restaurant = models.BooleanField(default=False)
    is_trainer = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} Profile"

# Signals to create or save UserProfile automatically when User is updated
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

class ChefProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='chef_profile')
    brand_name = models.CharField(max_length=150)
    specialty = models.CharField(max_length=100)
    experience_years = models.IntegerField(default=0)
    location = models.CharField(max_length=200, blank=True, null=True)
    bio = models.TextField(blank=True)
    social_links = models.TextField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.brand_name or f"{self.user.username}'s Chef Profile"

class RestaurantProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='restaurant_profile')
    restaurant_name = models.CharField(max_length=150)
    license_number = models.CharField(max_length=50)
    location_url = models.TextField(blank=True)
    working_hours = models.CharField(max_length=100)
    cuisine_type = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=20)
    delivery_available = models.BooleanField(default=False)
    social_links = models.TextField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.restaurant_name

class Recipe(models.Model):
    CATEGORY_CHOICES = (
        ('Breakfast', 'فطور'),
        ('Lunch', 'غداء'),
        ('Dinner', 'عشاء'),
        ('Snack', 'سناك'),
    )
    DIET_CHOICES = (
        ('Regular', 'عادي'),
        ('Keto', 'كيتو'),
        ('Vegan', 'نباتي'),
        ('Vegetarian', 'نباتي (ألبان/بيض)'),
        ('GlutenFree', 'خالي من الجلوتين'),
    )
    ITEM_TYPE_CHOICES = (
        ('food', 'طعام'),
        ('drink', 'مشروب'),
    )
    SIZE_CHOICES = (
        ('small', 'صغير'),
        ('medium', 'وسط'),
        ('large', 'كبير'),
    )

    chef = models.ForeignKey(ChefProfile, on_delete=models.CASCADE, related_name='recipes', null=True, blank=True)
    restaurant = models.ForeignKey(RestaurantProfile, on_delete=models.CASCADE, related_name='menu_items', null=True, blank=True)
    title = models.CharField(max_length=200)
    image = models.ImageField(upload_to='recipes/', default='default_recipe.png')
    description = models.TextField()
    ingredients = models.TextField()
    instructions = models.TextField(blank=True, null=True)
    
    cooking_time = models.IntegerField(help_text="Cooking time in minutes", default=15)
    
    price = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    is_available = models.BooleanField(default=True)
    
    DIFFICULTY_CHOICES = (
        ('Easy', 'سهل'),
        ('Medium', 'متوسط'),
        ('Hard', 'محترف'),
    )
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, blank=True, null=True)
    chef_tip = models.TextField(blank=True, null=True)

    # Drinks system
    item_type = models.CharField(max_length=10, choices=ITEM_TYPE_CHOICES, default='food')
    size = models.CharField(max_length=10, choices=SIZE_CHOICES, blank=True, null=True)
    benefits = models.TextField(blank=True, null=True, help_text='الفوائد الصحية للمشروب')
    
    calories = models.DecimalField(max_digits=6, decimal_places=2)
    protein = models.DecimalField(max_digits=6, decimal_places=2)
    carbs = models.DecimalField(max_digits=6, decimal_places=2)
    fats = models.DecimalField(max_digits=6, decimal_places=2)
    
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    diet_type = models.CharField(max_length=50, choices=DIET_CHOICES)
    
    likes = models.ManyToManyField(User, related_name='liked_recipes', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class Comment(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.recipe.title}"

class Follow(models.Model):
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    chef = models.ForeignKey(ChefProfile, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'chef')

    def __str__(self):
        return f"{self.follower.username} follows {self.chef.user.username}"

class SavedRecipe(models.Model):
    user = models.ForeignKey(User, related_name='saved_recipes', on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, related_name='saved_by', on_delete=models.CASCADE)
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'recipe')

    def __str__(self):
        return f"{self.user.username} saved {self.recipe.title}"


class FollowRestaurant(models.Model):
    follower   = models.ForeignKey(User, related_name='following_restaurants', on_delete=models.CASCADE)
    restaurant = models.ForeignKey(RestaurantProfile, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'restaurant')

    def __str__(self):
        return f"{self.follower.username} follows {self.restaurant.restaurant_name}"


class FollowTrainer(models.Model):
    follower = models.ForeignKey(User, related_name='following_trainers', on_delete=models.CASCADE)
    trainer  = models.ForeignKey('TrainerProfile', related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'trainer')

    def __str__(self):
        return f"{self.follower.username} follows trainer {self.trainer.user.username}"


# =============================================
# Trainer System
# =============================================

class TrainerProfile(models.Model):
    SPECIALIZATION_CHOICES = (
        ('weight_loss', 'خسارة الوزن'),
        ('muscle_gain', 'بناء العضلات'),
        ('cardio', 'كارديو واللياقة'),
        ('yoga', 'يوغا وتمدد'),
        ('crossfit', 'كروس فت'),
        ('rehabilitation', 'إعادة تأهيل'),
        ('nutrition_fitness', 'تغذية ولياقة'),
        ('general', 'لياقة عامة'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='trainer_profile')
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES, default='general')
    experience_years = models.IntegerField(default=0)
    bio = models.TextField(blank=True)
    license_number = models.CharField(max_length=100, blank=True)
    is_verified = models.BooleanField(default=False)
    social_links = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - Trainer ({self.get_specialization_display()})"


class WorkoutVideo(models.Model):
    DIFFICULTY_CHOICES = (
        ('beginner', 'مبتدئ'),
        ('intermediate', 'متوسط'),
        ('advanced', 'محترف'),
    )

    trainer = models.ForeignKey(TrainerProfile, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=200)
    video_file = models.FileField(upload_to='workout_videos/', blank=True, null=True)
    burned_calories = models.IntegerField(default=0, help_text='السعرات المحروقة المتوقعة')
    duration = models.IntegerField(default=0, help_text='مدة التمرين بالدقائق')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # تفاعلات
    likes    = models.ManyToManyField(User, blank=True, related_name='liked_workouts')
    saves    = models.ManyToManyField(User, blank=True, related_name='saved_workouts')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} by {self.trainer.user.username}"


class WorkoutVideoComment(models.Model):
    video      = models.ForeignKey(WorkoutVideo, on_delete=models.CASCADE, related_name='comments')
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workout_comments')
    text       = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} → {self.video.title[:30]}"# =============================================
# Community Posts System
# =============================================

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    image = models.ImageField(upload_to='community_posts/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='liked_community_posts', blank=True)
    saves = models.ManyToManyField(User, related_name='saved_community_posts', blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Post by {self.user.username} at {self.created_at}"

class PostComment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post_comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.user.username} on Post {self.post.id}"

class UserFollow(models.Model):
    follower = models.ForeignKey(User, related_name='user_following', on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='user_followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"
