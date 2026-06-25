from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth import authenticate

from .models import HealthProfile, HealthCheck, WorkoutVideo, TrainerProfile, WorkoutVideoComment
from .serializers import (
    HealthProfileSerializer, HealthCheckSerializer, RegisterSerializer, UserSerializer,
    WorkoutVideoCommentSerializer
)

class HealthProfileCreateView(CreateAPIView):
    queryset = HealthProfile.objects.all()
    serializer_class = HealthProfileSerializer

class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "user": UserSerializer(user).data,
            "token": token.key
        }, status=status.HTTP_201_CREATED)

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })

class SaveHealthCheckView(CreateAPIView):
    serializer_class = HealthCheckSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class HealthCheckHistoryView(ListAPIView):
    serializer_class = HealthCheckSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        records = HealthCheck.objects.filter(user=user).order_by('-created_at')
        
        seen_dates = set()
        latest_per_day = []
        for record in records:
            date_str = record.created_at.date()
            if date_str not in seen_dates:
                seen_dates.add(date_str)
                latest_per_day.append(record.id)
                
        # Return records grouped as latest per day, ordered chronologically (oldest first for chart)
        return HealthCheck.objects.filter(id__in=latest_per_day).order_by('created_at')

from rest_framework.parsers import MultiPartParser, FormParser
from .models import UserProfile
from .serializers import UserProfileSerializer

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request, *args, **kwargs):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from django.shortcuts import get_object_or_404
from .models import ChefProfile, RestaurantProfile, Recipe, Comment, Follow, SavedRecipe, FollowRestaurant, FollowTrainer
from .serializers import ChefProfileSerializer, RestaurantProfileSerializer, RecipeSerializer, CommentSerializer, PublicChefProfileSerializer

class ChefProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            profile = ChefProfile.objects.get(user=request.user)
            serializer = ChefProfileSerializer(profile)
            return Response(serializer.data)
        except ChefProfile.DoesNotExist:
            return Response({"detail": "Not a chef."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, *args, **kwargs):
        if hasattr(request.user, 'chef_profile'):
            profile = request.user.chef_profile
            serializer = ChefProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                if hasattr(request.user, 'profile'):
                    request.user.profile.is_chef = True
                    request.user.profile.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ChefProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, is_verified=False)
            if hasattr(request.user, 'profile'):
                request.user.profile.is_chef = True
                request.user.profile.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        try:
            profile = ChefProfile.objects.get(user=request.user)
            # Soft disable recipes
            profile.recipes.update(is_active=False)
            if hasattr(request.user, 'profile'):
                request.user.profile.is_chef = False
                request.user.profile.save()
            return Response({"detail": "Profile deactivated successfully"}, status=status.HTTP_200_OK)
        except ChefProfile.DoesNotExist:
            return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, *args, **kwargs):
        try:
            profile = ChefProfile.objects.get(user=request.user)
        except ChefProfile.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
            
        serializer = ChefProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RestaurantProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            profile = RestaurantProfile.objects.get(user=request.user)
            serializer = RestaurantProfileSerializer(profile)
            return Response(serializer.data)
        except RestaurantProfile.DoesNotExist:
            return Response({"detail": "Not a restaurant."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, *args, **kwargs):
        if hasattr(request.user, 'restaurant_profile'):
            profile = request.user.restaurant_profile
            serializer = RestaurantProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                if hasattr(request.user, 'profile'):
                    request.user.profile.is_restaurant = True
                    request.user.profile.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = RestaurantProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, is_verified=False)
            if hasattr(request.user, 'profile'):
                request.user.profile.is_restaurant = True
                request.user.profile.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        try:
            profile = RestaurantProfile.objects.get(user=request.user)
            # Soft disable menu items
            profile.menu_items.update(is_active=False)
            if hasattr(request.user, 'profile'):
                request.user.profile.is_restaurant = False
                request.user.profile.save()
            return Response({"detail": "Profile deactivated successfully"}, status=status.HTTP_200_OK)
        except RestaurantProfile.DoesNotExist:
            return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, *args, **kwargs):
        try:
            profile = RestaurantProfile.objects.get(user=request.user)
        except RestaurantProfile.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
            
        serializer = RestaurantProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RecipeCreateView(CreateAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        chef_profile = getattr(self.request.user, 'chef_profile', None)
        rest_profile = getattr(self.request.user, 'restaurant_profile', None)
        owner_type = self.request.data.get('owner_type', None)

        if owner_type == 'restaurant' and rest_profile:
            serializer.save(restaurant=rest_profile)
        elif owner_type == 'chef' and chef_profile:
            serializer.save(chef=chef_profile)
        elif rest_profile and not chef_profile:
            serializer.save(restaurant=rest_profile)
        elif chef_profile and not rest_profile:
            serializer.save(chef=chef_profile)
        else:
            raise PermissionDenied("يجب أن تمتلك حساب شيف أو مطعم لإضافة محتوى.")

class RecipeListView(ListAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Recipe.objects.filter(is_active=True).order_by('-created_at')
        
        chef_id = self.request.query_params.get('chef_id', None)
        rest_id = self.request.query_params.get('restaurant_id', None)
        diet_type = self.request.query_params.get('diet_type', None)
        category = self.request.query_params.get('category', None)
        min_calories = self.request.query_params.get('min_calories', None)
        max_calories = self.request.query_params.get('max_calories', None)
        cooking_time = self.request.query_params.get('cooking_time', None)
        min_protein = self.request.query_params.get('min_protein', None)
        
        if chef_id:
            try: queryset = queryset.filter(chef__id=int(chef_id))
            except ValueError: pass
            
        if rest_id:
            try: queryset = queryset.filter(restaurant__id=int(rest_id))
            except ValueError: pass

        if diet_type:
            types = [t.strip() for t in diet_type.split(',')]
            queryset = queryset.filter(diet_type__in=types)
            
        if category:
            queryset = queryset.filter(category=category)
            
        if min_calories:
            try: queryset = queryset.filter(calories__gte=float(min_calories))
            except ValueError: pass
            
        if max_calories:
            try: queryset = queryset.filter(calories__lte=float(max_calories))
            except ValueError: pass
            
        if cooking_time:
            try: queryset = queryset.filter(cooking_time__lte=int(cooking_time))
            except ValueError: pass

        if min_protein:
            try: queryset = queryset.filter(protein__gte=float(min_protein))
            except ValueError: pass
            
        return queryset

class RecipeDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method not in permissions.SAFE_METHODS:
            chef_profile = getattr(request.user, 'chef_profile', None)
            rest_profile = getattr(request.user, 'restaurant_profile', None)
            
            if obj.chef and obj.chef != chef_profile:
                raise PermissionDenied("ليس لديك الصلاحية لتعديل أو حذف هذه الوصفة.")
            if obj.restaurant and obj.restaurant != rest_profile:
                raise PermissionDenied("ليس لديك الصلاحية لتعديل أو حذف هذا الصنف.")
            
            if not obj.chef and not obj.restaurant:
                raise PermissionDenied("غير مسموح.")

    def perform_destroy(self, instance):
        if instance.image:
            instance.image.delete(save=False)
        instance.delete()

class ToggleLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, recipe_id):
        recipe = get_object_or_404(Recipe, id=recipe_id)
        if request.user in recipe.likes.all():
            recipe.likes.remove(request.user)
            liked = False
        else:
            recipe.likes.add(request.user)
            liked = True
        return Response({'liked': liked, 'likes_count': recipe.likes.count()})

class RecipeCommentCreateView(CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        recipe_id = self.kwargs.get('recipe_id')
        recipe = get_object_or_404(Recipe, id=recipe_id)
        serializer.save(user=self.request.user, recipe=recipe)


class CommentDetailView(APIView):
    """Edit or Delete a recipe comment (owner only)"""
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, comment_id, user):
        comment = get_object_or_404(Comment, id=comment_id)
        if comment.user != user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("ليس لديك صلاحية تعديل هذا التعليق.")
        return comment

    def put(self, request, comment_id):
        comment = self.get_object(comment_id, request.user)
        serializer = CommentSerializer(comment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, comment_id):
        comment = self.get_object(comment_id, request.user)
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PublicChefProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, chef_id):
        chef = get_object_or_404(ChefProfile, id=chef_id)
        chef_data = PublicChefProfileSerializer(chef, context={'request': request}).data
        recipes = Recipe.objects.filter(chef=chef).order_by('-created_at')
        recipes_data = RecipeSerializer(recipes, many=True, context={'request': request}).data
        
        return Response({
            'chef': chef_data,
            'recipes': recipes_data
        })


class PublicRestaurantProfileView(APIView):
    """بروفايل عام للمطعم — لا يتطلب مصادقة"""
    permission_classes = [permissions.AllowAny]

    def get(self, request, restaurant_id):
        restaurant = get_object_or_404(RestaurantProfile, id=restaurant_id)

        # بيانات المطعم الأساسية
        restaurant_data = {
            'id':               restaurant.id,
            'restaurant_name':  restaurant.restaurant_name,
            'cuisine_type':     restaurant.cuisine_type,
            'location_url':     restaurant.location_url,
            'working_hours':    restaurant.working_hours,
            'contact_number':   restaurant.contact_number,
            'delivery_available': restaurant.delivery_available,
            'social_links':     restaurant.social_links,
            'is_verified':      restaurant.is_verified,
            'profile_picture':  None,
        }

        # is_followed & followers_count
        is_followed = False
        if request.user.is_authenticated:
            is_followed = FollowRestaurant.objects.filter(follower=request.user, restaurant=restaurant).exists()
        restaurant_data['followers_count']      = restaurant.followers.count()
        restaurant_data['is_followed_by_user']  = is_followed

        # صورة البروفايل من UserProfile المرتبط
        try:
            pic = restaurant.user.profile.profile_picture
            if pic:
                restaurant_data['profile_picture'] = request.build_absolute_uri(pic.url)
        except Exception:
            pass

        # منشورات المطعم
        recipes = Recipe.objects.filter(
            restaurant=restaurant, is_active=True
        ).order_by('-created_at')
        recipes_data = RecipeSerializer(
            recipes, many=True, context={'request': request}
        ).data

        return Response({
            'restaurant': restaurant_data,
            'recipes':    recipes_data,
        })

class ToggleFollowView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, chef_id):
        chef = get_object_or_404(ChefProfile, id=chef_id)
        if request.user == chef.user:
            return Response({"detail": "لا يمكنك متابعة نفسك."}, status=status.HTTP_400_BAD_REQUEST)
            
        follow, created = Follow.objects.get_or_create(follower=request.user, chef=chef)
        if not created:
            follow.delete()
            is_followed = False
        else:
            is_followed = True
            
        return Response({
            'is_followed': is_followed,
            'followers_count': chef.followers.count()
        })


class ToggleFollowRestaurantView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, restaurant_id):
        restaurant = get_object_or_404(RestaurantProfile, id=restaurant_id)
        if request.user == restaurant.user:
            return Response({"detail": "لا يمكنك متابعة نفسك."}, status=status.HTTP_400_BAD_REQUEST)
        follow, created = FollowRestaurant.objects.get_or_create(follower=request.user, restaurant=restaurant)
        if not created:
            follow.delete()
            is_followed = False
        else:
            is_followed = True
        return Response({
            'is_followed': is_followed,
            'followers_count': restaurant.followers.count()
        })


class ToggleFollowTrainerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, trainer_id):
        trainer = get_object_or_404(TrainerProfile, id=trainer_id)
        if request.user == trainer.user:
            return Response({"detail": "لا يمكنك متابعة نفسك."}, status=status.HTTP_400_BAD_REQUEST)
        follow, created = FollowTrainer.objects.get_or_create(follower=request.user, trainer=trainer)
        if not created:
            follow.delete()
            is_followed = False
        else:
            is_followed = True
        return Response({
            'is_followed': is_followed,
            'followers_count': trainer.followers.count()
        })

class ToggleSaveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, recipe_id):
        recipe = get_object_or_404(Recipe, id=recipe_id)
        saved, created = SavedRecipe.objects.get_or_create(user=request.user, recipe=recipe)
        if not created:
            saved.delete()
            is_saved = False
        else:
            is_saved = True
        return Response({'is_saved': is_saved, 'saved_count': recipe.saved_by.count()})

class SavedRecipesListView(ListAPIView):
    """وصفات الشيفات المحفوظة فقط (بدون مطاعم)"""
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Recipe.objects.filter(
            saved_by__user=self.request.user,
            restaurant__isnull=True,       # وصفات الشيف فقط
            is_active=True
        ).order_by('-saved_by__saved_at')

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}


class SavedRestaurantItemsView(ListAPIView):
    """أصناف المطاعم المحفوظة فقط"""
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Recipe.objects.filter(
            saved_by__user=self.request.user,
            restaurant__isnull=False,      # أصناف المطاعم فقط
            is_active=True
        ).order_by('-saved_by__saved_at')

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'request': self.request}


# =============================================
# Trainer Views
# =============================================
from .models import TrainerProfile, WorkoutVideo
from .serializers import TrainerProfileSerializer, WorkoutVideoSerializer

class TrainerProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            profile = TrainerProfile.objects.get(user=request.user)
            serializer = TrainerProfileSerializer(profile, context={'request': request})
            return Response(serializer.data)
        except TrainerProfile.DoesNotExist:
            return Response({"detail": "Not a trainer."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, *args, **kwargs):
        if hasattr(request.user, 'trainer_profile'):
            profile = request.user.trainer_profile
            serializer = TrainerProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                if hasattr(request.user, 'profile'):
                    request.user.profile.is_trainer = True
                    request.user.profile.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = TrainerProfileSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user, is_verified=False)
            if hasattr(request.user, 'profile'):
                request.user.profile.is_trainer = True
                request.user.profile.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        try:
            profile = TrainerProfile.objects.get(user=request.user)
            profile.videos.update(is_active=False)
            if hasattr(request.user, 'profile'):
                request.user.profile.is_trainer = False
                request.user.profile.save()
            return Response({"detail": "Trainer profile deactivated."}, status=status.HTTP_200_OK)
        except TrainerProfile.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)


class PublicTrainerProfileView(APIView):
    """بروفايل عام للمدرب — لا يتطلب مصادقة"""
    permission_classes = [permissions.AllowAny]

    def get(self, request, trainer_id):
        trainer = get_object_or_404(TrainerProfile, id=trainer_id)
        serializer = TrainerProfileSerializer(trainer, context={'request': request})
        data = serializer.data
        # followers
        is_followed = False
        if request.user.is_authenticated:
            is_followed = FollowTrainer.objects.filter(follower=request.user, trainer=trainer).exists()
        data['followers_count']     = trainer.followers.count()
        data['is_followed_by_user'] = is_followed
        return Response(data)


class WorkoutVideoUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request, *args, **kwargs):
        """جلب كل فيديوهات المدرب الحالي"""
        try:
            trainer = TrainerProfile.objects.get(user=request.user)
            videos = trainer.videos.filter(is_active=True)
            serializer = WorkoutVideoSerializer(videos, many=True, context={'request': request})
            return Response(serializer.data)
        except TrainerProfile.DoesNotExist:
            return Response({"detail": "Not a trainer."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, *args, **kwargs):
        """رفع فيديو تمرين جديد"""
        try:
            trainer = TrainerProfile.objects.get(user=request.user)
        except TrainerProfile.DoesNotExist:
            return Response({"detail": "يجب التسجيل كمدرب أولاً."}, status=status.HTTP_403_FORBIDDEN)

        serializer = WorkoutVideoSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(trainer=trainer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WorkoutVideoDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes     = (MultiPartParser, FormParser)

    def patch(self, request, video_id, *args, **kwargs):
        """تعديل بيانات فيديو التمرين (النصوص أو الملف أو كليهما)"""
        try:
            trainer = TrainerProfile.objects.get(user=request.user)
        except TrainerProfile.DoesNotExist:
            return Response({"detail": "Not a trainer."}, status=status.HTTP_403_FORBIDDEN)

        video = get_object_or_404(WorkoutVideo, id=video_id, trainer=trainer)

        # إذا تم رفع ملف جديد، احذف القديم من الـ disk أولاً
        if 'video_file' in request.FILES:
            if video.video_file:
                video.video_file.delete(save=False)

        serializer = WorkoutVideoSerializer(
            video, data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, video_id, *args, **kwargs):
        """حذف فيديو التمرين نهائياً من DB والـ disk"""
        try:
            trainer = TrainerProfile.objects.get(user=request.user)
        except TrainerProfile.DoesNotExist:
            return Response({"detail": "Not a trainer."}, status=status.HTTP_403_FORBIDDEN)

        video = get_object_or_404(WorkoutVideo, id=video_id, trainer=trainer)
        # حذف الملف الفعلي من مجلد media
        if video.video_file:
            video.video_file.delete(save=False)
        video.delete()
        return Response({"detail": "تم حذف الفيديو بنجاح."}, status=status.HTTP_200_OK)



class WorkoutVideoListView(ListAPIView):
    """قائمة عامة لكل فيديوهات التمارين للاستكشاف"""
    serializer_class   = WorkoutVideoSerializer
    permission_classes = [permissions.AllowAny]

    def get_serializer_context(self):
        """تمرير request للـ serializer لبناء absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset   = WorkoutVideo.objects.filter(is_active=True).select_related(
            'trainer__user__profile'
        ).order_by('-created_at')
        difficulty = self.request.query_params.get('difficulty', None)
        trainer_id = self.request.query_params.get('trainer_id', None)

        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        if trainer_id:
            try:
                queryset = queryset.filter(trainer__id=int(trainer_id))
            except ValueError:
                pass
        return queryset


# ──────────────────────────────────────────────────────────────────────────────
# Workout Video Interaction Views
# ──────────────────────────────────────────────────────────────────────────────

class WorkoutVideoPublicDetail(APIView):
    """جلب تفاصيل فيديو واحد مع بيانات التفاعل"""
    permission_classes = [permissions.AllowAny]

    def get(self, request, video_id):
        video = get_object_or_404(WorkoutVideo, id=video_id, is_active=True)
        serializer = WorkoutVideoSerializer(video, context={'request': request})
        return Response(serializer.data)


class WorkoutVideoLikeView(APIView):
    """Toggle إعجاب بفيديو تمرين"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, video_id):
        video = get_object_or_404(WorkoutVideo, id=video_id, is_active=True)
        if video.likes.filter(id=request.user.id).exists():
            video.likes.remove(request.user)
            liked = False
        else:
            video.likes.add(request.user)
            liked = True
        return Response({'liked': liked, 'likes_count': video.likes.count()})


class WorkoutVideoSaveView(APIView):
    """Toggle حفظ فيديو تمرين"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, video_id):
        video = get_object_or_404(WorkoutVideo, id=video_id, is_active=True)
        if video.saves.filter(id=request.user.id).exists():
            video.saves.remove(request.user)
            saved = False
        else:
            video.saves.add(request.user)
            saved = True
        return Response({'saved': saved})


class WorkoutVideoCommentView(APIView):
    """قائمة وإنشاء تعليقات فيديو التمرين"""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, video_id):
        video    = get_object_or_404(WorkoutVideo, id=video_id, is_active=True)
        comments = video.comments.select_related('user__profile').all()
        serializer = WorkoutVideoCommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, video_id):
        video = get_object_or_404(WorkoutVideo, id=video_id, is_active=True)
        serializer = WorkoutVideoCommentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(video=video, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WorkoutVideoCommentDetailView(APIView):
    """Edit or Delete a workout video comment (owner only)"""
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, comment_id, user):
        comment = get_object_or_404(WorkoutVideoComment, id=comment_id)
        if comment.user != user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("ليس لديك صلاحية تعديل هذا التعليق.")
        return comment

    def put(self, request, comment_id):
        comment = self.get_object(comment_id, request.user)
        serializer = WorkoutVideoCommentSerializer(comment, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, comment_id):
        comment = self.get_object(comment_id, request.user)
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WorkoutVideoSavedListView(APIView):
    """جلب كل الفيديوهات التي حفظها المستخدم الحالي"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        videos = WorkoutVideo.objects.filter(
            saves=request.user, is_active=True
        ).select_related('trainer__user__profile').order_by('-created_at')
        serializer = WorkoutVideoSerializer(videos, many=True, context={'request': request})
        return Response(serializer.data)

# =============================================
# Community Post Views
# =============================================
from .models import Post, PostComment
from .serializers import PostSerializer, PostCommentSerializer

class PostListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        queryset = Post.objects.select_related('user__profile').all()
        
        has_image = request.query_params.get('has_image', None)
        if has_image == 'true':
            queryset = queryset.exclude(image__exact='').exclude(image__isnull=True)
            
        serializer = PostSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PostDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self, post_id):
        return get_object_or_404(Post, id=post_id)

    def put(self, request, post_id):
        post = self.get_object(post_id)
        if post.user != request.user:
            raise PermissionDenied("ليس لديك صلاحية لتعديل هذا المنشور.")
        
        if 'image' in request.FILES and post.image:
            post.image.delete(save=False)

        if request.data.get('remove_image') == 'true':
            if post.image:
                post.image.delete(save=False)
            post.image = None

        serializer = PostSerializer(post, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, post_id):
        post = self.get_object(post_id)
        if post.user != request.user:
            raise PermissionDenied("ليس لديك صلاحية لحذف هذا المنشور.")
        
        if post.image:
            post.image.delete(save=False)
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class TogglePostLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        if post.likes.filter(id=request.user.id).exists():
            post.likes.remove(request.user)
            liked = False
        else:
            post.likes.add(request.user)
            liked = True
        return Response({'liked': liked, 'likes_count': post.likes.count()})

class TogglePostSaveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        if post.saves.filter(id=request.user.id).exists():
            post.saves.remove(request.user)
            saved = False
        else:
            post.saves.add(request.user)
            saved = True
        return Response({'saved': saved, 'saves_count': post.saves.count()})

class PostCommentListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        comments = post.comments.select_related('user__profile').all()
        serializer = PostCommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        serializer = PostCommentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(post=post, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PostCommentDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, comment_id):
        return get_object_or_404(PostComment, id=comment_id)

    def put(self, request, comment_id):
        comment = self.get_object(comment_id)
        if comment.user != request.user:
            raise PermissionDenied("ليس لديك صلاحية لتعديل هذا التعليق.")
        serializer = PostCommentSerializer(comment, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, comment_id):
        comment = self.get_object(comment_id)
        if comment.user != request.user:
            raise PermissionDenied("ليس لديك صلاحية لحذف هذا التعليق.")
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class SavedCommunityPostsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        posts = Post.objects.filter(saves=request.user).select_related('user__profile').order_by('-created_at')
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

from django.db.models import Q

class UserSearchView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        query = request.query_params.get('q', '')
        if len(query) < 1:
            return Response([])
            
        profiles = UserProfile.objects.filter(
            Q(user__username__icontains=query) | 
            Q(first_name__icontains=query) | 
            Q(last_name__icontains=query)
        ).select_related('user')[:10]
        
        from .serializers import UserSearchSerializer
        serializer = UserSearchSerializer(profiles, many=True, context={'request': request})
        return Response(serializer.data)

class PublicProfileView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, user_id):
        profile = get_object_or_404(UserProfile, user_id=user_id)
        from .serializers import PublicUserProfileSerializer
        serializer = PublicUserProfileSerializer(profile, context={'request': request})
        
        posts = Post.objects.filter(user_id=user_id).order_by('-created_at')
        post_serializer = PostSerializer(posts, many=True, context={'request': request})
        
        return Response({
            'profile': serializer.data,
            'posts': post_serializer.data
        })

class ToggleFollowUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        from django.contrib.auth.models import User
        from .models import UserFollow
        target_user = get_object_or_404(User, id=user_id)
        if request.user == target_user:
            return Response({"error": "You cannot follow yourself."}, status=400)
            
        follow, created = UserFollow.objects.get_or_create(follower=request.user, following=target_user)
        if not created:
            follow.delete()
            is_following = False
        else:
            is_following = True
            
        return Response({
            "is_following": is_following,
            "followers_count": target_user.user_followers.count(),
            "following_count": target_user.user_following.count()
        })



