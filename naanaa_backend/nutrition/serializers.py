from datetime import date, timedelta
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import HealthProfile, HealthCheck, UserProfile, WorkoutVideoComment


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['first_name', 'last_name', 'profile_picture', 'bio', 'is_chef', 'is_restaurant', 'is_trainer']
        extra_kwargs = {
            'is_chef': {'read_only': True},
            'is_restaurant': {'read_only': True},
            'is_trainer': {'read_only': True},
        }

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        if instance.profile_picture and hasattr(instance.profile_picture, 'url'):
            if request:
                ret['profile_picture'] = request.build_absolute_uri(instance.profile_picture.url)
        return ret


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class HealthCheckSerializer(serializers.ModelSerializer):
    date_formatted = serializers.SerializerMethodField(read_only=True)

    BMR = serializers.SerializerMethodField(read_only=True)
    TDEE = serializers.SerializerMethodField(read_only=True)
    Final_Calories = serializers.SerializerMethodField(read_only=True)
    BMI_Status = serializers.SerializerMethodField(read_only=True)
    Macros = serializers.SerializerMethodField(read_only=True)
    Water = serializers.SerializerMethodField(read_only=True)
    expected_weeks = serializers.SerializerMethodField(read_only=True)
    expected_date = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = HealthCheck
        fields = ['id', 'current_weight', 'target_weight', 'height', 'age', 'gender', 'activity_level', 'goal', 'calories', 'bmi', 'date_formatted', 'created_at', 'BMR', 'TDEE', 'Final_Calories', 'BMI_Status', 'Macros', 'Water', 'expected_weeks', 'expected_date']

    def get_date_formatted(self, obj):
        return obj.created_at.strftime("%d/%m/%Y")

    def get_BMR(self, obj):
        if not obj.height or not obj.age or not obj.gender or not obj.current_weight:
            return None
        if obj.gender == 'Male':
            return (10 * obj.current_weight) + (6.25 * obj.height) - (5 * obj.age) + 5
        else:
            return (10 * obj.current_weight) + (6.25 * obj.height) - (5 * obj.age) - 161

    def get_TDEE(self, obj):
        bmr = self.get_BMR(obj)
        if not bmr or not obj.activity_level:
            return None
        return bmr * obj.activity_level

    def get_Final_Calories(self, obj):
        # Already stored in DB, but just to match API
        return obj.calories

    def get_BMI_Status(self, obj):
        if not obj.bmi:
            return None
        bmi = obj.bmi
        if bmi < 18.5:
            return "نحافة"
        elif 18.5 <= bmi <= 24.9:
            return "مثالي"
        elif 25 <= bmi <= 29.9:
            return "زيادة وزن"
        else:
            return "سمنة"

    def get_Macros(self, obj):
        if not obj.calories:
            return None
        return {
            "Protein": round((obj.calories * 0.3) / 4, 2),
            "Carbs": round((obj.calories * 0.4) / 4, 2),
            "Fat": round((obj.calories * 0.3) / 9, 2)
        }

    def get_Water(self, obj):
        if not obj.current_weight:
            return None
        return round(obj.current_weight * 0.033, 2)

    def get_expected_weeks(self, obj):
        if not obj.target_weight or obj.target_weight == obj.current_weight or obj.goal == 'Maintain':
            return 0
        difference = abs(obj.target_weight - obj.current_weight)
        return int(difference / 0.5)

    def get_expected_date(self, obj):
        weeks = self.get_expected_weeks(obj)
        if weeks == 0:
            return None
        target_date = date.today() + timedelta(days=weeks * 7)
        return target_date.strftime("%d/%m/%Y")

class HealthProfileSerializer(serializers.ModelSerializer):
    BMR = serializers.SerializerMethodField(read_only=True)
    TDEE = serializers.SerializerMethodField(read_only=True)
    Final_Calories = serializers.SerializerMethodField(read_only=True)
    BMI = serializers.SerializerMethodField(read_only=True)
    BMI_Status = serializers.SerializerMethodField(read_only=True)
    Macros = serializers.SerializerMethodField(read_only=True)
    Water = serializers.SerializerMethodField(read_only=True)
    expected_weeks = serializers.SerializerMethodField(read_only=True)
    expected_date = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = HealthProfile
        fields = '__all__'

    def get_BMR(self, obj):
        # Mifflin-St Jeor Equation
        if obj.gender == 'Male':
            return (10 * obj.weight) + (6.25 * obj.height) - (5 * obj.age) + 5
        else:
            return (10 * obj.weight) + (6.25 * obj.height) - (5 * obj.age) - 161

    def get_TDEE(self, obj):
        return self.get_BMR(obj) * obj.activity_level

    def get_Final_Calories(self, obj):
        tdee = self.get_TDEE(obj)
        if obj.goal == 'Lose':
            return tdee - 500
        elif obj.goal == 'Gain':
            return tdee + 500
        else:
            return tdee

    def get_BMI(self, obj):
        return obj.weight / ((obj.height / 100) ** 2)
        
    def get_BMI_Status(self, obj):
        bmi = self.get_BMI(obj)
        if bmi < 18.5:
            return "نحافة"
        elif 18.5 <= bmi <= 24.9:
            return "مثالي"
        elif 25 <= bmi <= 29.9:
            return "زيادة وزن"
        else:
            return "سمنة"

    def get_Macros(self, obj):
        calories = self.get_Final_Calories(obj)
        return {
            "Protein": round((calories * 0.3) / 4, 2),
            "Carbs": round((calories * 0.4) / 4, 2),
            "Fat": round((calories * 0.3) / 9, 2)
        }

    def get_Water(self, obj):
        return round(obj.weight * 0.033, 2)

    def get_expected_weeks(self, obj):
        if not obj.target_weight or obj.target_weight == obj.weight or obj.goal == 'Maintain':
            return 0
        difference = abs(obj.target_weight - obj.weight)
        return int(difference / 0.5)

    def get_expected_date(self, obj):
        weeks = self.get_expected_weeks(obj)
        if weeks == 0:
            return None
        target_date = date.today() + timedelta(days=weeks * 7)
        return target_date.strftime("%d/%m/%Y")

from .models import ChefProfile, RestaurantProfile, Recipe, Comment, Follow, SavedRecipe

class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_profile_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'user_name', 'user_profile_picture', 'content', 'created_at']
        read_only_fields = ['user']
        
    def get_user_name(self, obj):
        if hasattr(obj.user, 'profile') and (obj.user.profile.first_name or obj.user.profile.last_name):
            return f"{obj.user.profile.first_name} {obj.user.profile.last_name}".strip()
        return obj.user.username
        
    def get_user_profile_picture(self, obj):
        request = self.context.get('request')
        if hasattr(obj.user, 'profile') and obj.user.profile.profile_picture:
            url = obj.user.profile.profile_picture.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

class ChefProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChefProfile
        fields = ['id', 'brand_name', 'specialty', 'experience_years', 'location', 'bio', 'social_links', 'is_verified', 'created_at']

class RestaurantProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantProfile
        fields = ['id', 'restaurant_name', 'license_number', 'location_url', 'working_hours', 'cuisine_type', 'contact_number', 'delivery_available', 'social_links', 'is_verified', 'created_at']

class PublicChefProfileSerializer(serializers.ModelSerializer):
    profile_picture      = serializers.SerializerMethodField(read_only=True)
    followers_count      = serializers.SerializerMethodField(read_only=True)
    is_followed_by_user  = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ChefProfile
        fields = [
            'id', 'brand_name', 'specialty', 'location',
            'bio', 'experience_years', 'social_links', 'is_verified',
            'profile_picture', 'followers_count', 'is_followed_by_user'
        ]

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.user and hasattr(obj.user, 'profile') and obj.user.profile.profile_picture:
            url = obj.user.profile.profile_picture.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_is_followed_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=request.user, chef=obj).exists()
        return False

class RecipeSerializer(serializers.ModelSerializer):
    chef_name = serializers.SerializerMethodField()
    chef_user_id = serializers.SerializerMethodField()
    chef_profile_picture = serializers.SerializerMethodField(read_only=True)
    likes_count = serializers.SerializerMethodField(read_only=True)
    is_liked_by_user = serializers.SerializerMethodField(read_only=True)
    is_saved_by_user = serializers.SerializerMethodField(read_only=True)
    saved_count = serializers.SerializerMethodField(read_only=True)
    comments = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Recipe
        fields = [
            'id', 'chef', 'restaurant', 'chef_name', 'chef_user_id', 'chef_profile_picture', 'title', 'image', 'description',
            'ingredients', 'instructions', 'cooking_time', 'calories', 'protein',
            'carbs', 'fats', 'category', 'diet_type', 'price', 'is_available',
            'difficulty_level', 'chef_tip', 'item_type', 'size', 'benefits',
            'likes_count', 'is_liked_by_user',
            'is_saved_by_user', 'saved_count', 'comments', 'created_at'
        ]
        read_only_fields = ['chef', 'restaurant', 'created_at']
        
    def get_chef_name(self, obj):
        if obj.restaurant: return obj.restaurant.restaurant_name
        if obj.chef: return obj.chef.brand_name
        return "Unknown"

    def get_chef_user_id(self, obj):
        if obj.restaurant and hasattr(obj.restaurant, 'user') and obj.restaurant.user: return obj.restaurant.user.id
        if obj.chef and hasattr(obj.chef, 'user') and obj.chef.user: return obj.chef.user.id
        return None

    def get_comments(self, obj):
        comments = obj.comments.all().order_by('-created_at')
        return CommentSerializer(comments, many=True, context=self.context).data

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_is_saved_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedRecipe.objects.filter(user=request.user, recipe=obj).exists()
        return False

    def get_saved_count(self, obj):
        return obj.saved_by.count()

    def get_chef_profile_picture(self, obj):
        request = self.context.get('request')
        target_profile = None
        if obj.restaurant and hasattr(obj.restaurant, 'user') and obj.restaurant.user and hasattr(obj.restaurant.user, 'profile'):
             target_profile = obj.restaurant.user.profile
        elif obj.chef and hasattr(obj.chef, 'user') and obj.chef.user and hasattr(obj.chef.user, 'profile'):
             target_profile = obj.chef.user.profile
             
        if target_profile and target_profile.profile_picture:
             url = target_profile.profile_picture.url
             if request:
                 return request.build_absolute_uri(url)
             return url
        return None

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image and hasattr(instance.image, 'url'):
            if request:
                ret['image'] = request.build_absolute_uri(instance.image.url)
        return ret


# =============================================
# Trainer Serializers
# =============================================
from .models import TrainerProfile, WorkoutVideo

class TrainerProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField(read_only=True)
    specialization_display = serializers.SerializerMethodField(read_only=True)
    trainer_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = TrainerProfile
        fields = [
            'id', 'specialization', 'specialization_display',
            'experience_years', 'bio', 'license_number',
            'social_links', 'is_verified', 'created_at', 'trainer_name', 'profile_picture'
        ]
        read_only_fields = ['is_verified', 'created_at']

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.user and hasattr(obj.user, 'profile') and obj.user.profile.profile_picture:
            url = obj.user.profile.profile_picture.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_trainer_name(self, obj):
        if hasattr(obj.user, 'profile'):
            p = obj.user.profile
            full = f"{p.first_name} {p.last_name}".strip()
            if full:
                return full
        return obj.user.username

    def get_specialization_display(self, obj):
        return obj.get_specialization_display()


class WorkoutVideoSerializer(serializers.ModelSerializer):
    trainer_name            = serializers.SerializerMethodField(read_only=True)
    trainer_id              = serializers.SerializerMethodField(read_only=True)
    trainer_profile_picture = serializers.SerializerMethodField(read_only=True)
    difficulty_display      = serializers.SerializerMethodField(read_only=True)
    video_url               = serializers.SerializerMethodField(read_only=True)
    likes_count             = serializers.SerializerMethodField(read_only=True)
    is_liked                = serializers.SerializerMethodField(read_only=True)
    is_saved                = serializers.SerializerMethodField(read_only=True)
    comments_count          = serializers.SerializerMethodField(read_only=True)
    # video_file: write-only — received on upload, stored in DB, never returned
    video_file              = serializers.FileField(write_only=True, required=False)

    class Meta:
        model  = WorkoutVideo
        fields = [
            'id', 'trainer', 'trainer_name', 'trainer_id', 'trainer_profile_picture',
            'title', 'video_file', 'video_url', 'burned_calories', 'duration',
            'difficulty', 'difficulty_display', 'description', 'is_active', 'created_at',
            'likes_count', 'is_liked', 'is_saved', 'comments_count'
        ]
        read_only_fields = ['trainer', 'created_at', 'is_active',
                            'video_url', 'trainer_name', 'trainer_id',
                            'trainer_profile_picture', 'difficulty_display',
                            'likes_count', 'is_liked', 'is_saved', 'comments_count']

    def get_trainer_name(self, obj):
        if hasattr(obj.trainer.user, 'profile'):
            p    = obj.trainer.user.profile
            full = f"{p.first_name} {p.last_name}".strip()
            if full:
                return full
        return obj.trainer.user.username

    def get_trainer_id(self, obj):
        return obj.trainer.id

    def get_trainer_profile_picture(self, obj):
        request = self.context.get('request')
        try:
            url = obj.trainer.user.profile.profile_picture.url
            return request.build_absolute_uri(url) if request else url
        except Exception:
            return None

    def get_difficulty_display(self, obj):
        return obj.get_difficulty_display()

    def get_video_url(self, obj):
        request = self.context.get('request')
        if obj.video_file and hasattr(obj.video_file, 'url'):
            return request.build_absolute_uri(obj.video_file.url) if request else obj.video_file.url
        return None

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.saves.filter(id=request.user.id).exists()
        return False

    def get_comments_count(self, obj):
        return obj.comments.count()


class WorkoutVideoCommentSerializer(serializers.ModelSerializer):
    user_name    = serializers.SerializerMethodField(read_only=True)
    user_picture = serializers.SerializerMethodField(read_only=True)
    user_id      = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = WorkoutVideoComment
        fields = ['id', 'video', 'user_id', 'user_name', 'user_picture', 'text', 'created_at']
        read_only_fields = ['video', 'created_at']

    def get_user_name(self, obj):
        try:
            p    = obj.user.profile
            full = f"{p.first_name} {p.last_name}".strip()
            return full or obj.user.username
        except Exception:
            return obj.user.username

    def get_user_picture(self, obj):
        request = self.context.get('request')
        try:
            url = obj.user.profile.profile_picture.url
            return request.build_absolute_uri(url) if request else url
        except Exception:
            return None

    def get_user_id(self, obj):
        return obj.user_id

# =============================================
# Community Post Serializers
# =============================================
from .models import Post, PostComment, UserFollow

class UserSearchSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['user_id', 'username', 'first_name', 'last_name', 'profile_picture']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        if instance.profile_picture and hasattr(instance.profile_picture, 'url'):
            if request:
                ret['profile_picture'] = request.build_absolute_uri(instance.profile_picture.url)
        return ret

class PublicUserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'username', 'first_name', 'last_name', 'profile_picture', 'bio', 'followers_count', 'following_count', 'is_following']

    def get_followers_count(self, obj):
        return obj.user.user_followers.count()

    def get_following_count(self, obj):
        return obj.user.user_following.count()

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserFollow.objects.filter(follower=request.user, following=obj.user).exists()
        return False
        
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        if instance.profile_picture and hasattr(instance.profile_picture, 'url'):
            if request:
                ret['profile_picture'] = request.build_absolute_uri(instance.profile_picture.url)
        return ret

class PostCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField(read_only=True)
    user_picture = serializers.SerializerMethodField(read_only=True)
    user_id = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PostComment
        fields = ['id', 'post', 'user_id', 'user_name', 'user_picture', 'text', 'created_at']
        read_only_fields = ['post', 'created_at']

    def get_user_name(self, obj):
        try:
            p = obj.user.profile
            full = f"{p.first_name} {p.last_name}".strip()
            return full or obj.user.username
        except Exception:
            return obj.user.username

    def get_user_picture(self, obj):
        request = self.context.get('request')
        try:
            if obj.user.profile.profile_picture:
                url = obj.user.profile.profile_picture.url
                return request.build_absolute_uri(url) if request else url
        except Exception:
            return None
        return None

    def get_user_id(self, obj):
        return obj.user_id

class PostSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField(read_only=True)
    user_id = serializers.SerializerMethodField(read_only=True)
    user_profile_picture = serializers.SerializerMethodField(read_only=True)
    likes_count = serializers.SerializerMethodField(read_only=True)
    saves_count = serializers.SerializerMethodField(read_only=True)
    is_liked = serializers.SerializerMethodField(read_only=True)
    is_saved = serializers.SerializerMethodField(read_only=True)
    comments_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'user_id', 'user_name', 'user_profile_picture',
            'content', 'image', 'created_at',
            'likes_count', 'saves_count', 'is_liked', 'is_saved', 'comments_count'
        ]
        read_only_fields = ['created_at']

    def get_user_name(self, obj):
        try:
            p = obj.user.profile
            full = f"{p.first_name} {p.last_name}".strip()
            return full or obj.user.username
        except Exception:
            return obj.user.username

    def get_user_id(self, obj):
        return obj.user.id

    def get_user_profile_picture(self, obj):
        request = self.context.get('request')
        try:
            if obj.user.profile.profile_picture:
                url = obj.user.profile.profile_picture.url
                return request.build_absolute_uri(url) if request else url
        except Exception:
            return None
        return None

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.saves.filter(id=request.user.id).exists()
        return False

    def get_saves_count(self, obj):
        return obj.saves.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image and hasattr(instance.image, 'url'):
            if request:
                ret['image'] = request.build_absolute_uri(instance.image.url)
        return ret

