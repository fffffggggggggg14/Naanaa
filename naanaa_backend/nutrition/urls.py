from django.urls import path
from .views import (
    HealthProfileCreateView, RegisterView, CustomAuthToken,
    SaveHealthCheckView, HealthCheckHistoryView, UserProfileView,
    ChefProfileView, RestaurantProfileView, RecipeCreateView, RecipeListView, ToggleLikeView, RecipeDetailView,
    RecipeCommentCreateView, CommentDetailView,
    PublicChefProfileView, PublicRestaurantProfileView, ToggleFollowView,
    ToggleFollowRestaurantView, ToggleFollowTrainerView,
    ToggleSaveView, SavedRecipesListView, SavedRestaurantItemsView,
    TrainerProfileView, PublicTrainerProfileView,
    WorkoutVideoUploadView, WorkoutVideoDetailView, WorkoutVideoListView,
    WorkoutVideoPublicDetail, WorkoutVideoLikeView, WorkoutVideoSaveView,
    WorkoutVideoCommentView, WorkoutVideoCommentDetailView,
    WorkoutVideoSavedListView,
    PostListCreateView, PostDetailView, TogglePostLikeView, TogglePostSaveView,
    PostCommentListCreateView, PostCommentDetailView, SavedCommunityPostsView,
    PublicProfileView, ToggleFollowUserView, UserSearchView
)

urlpatterns = [
    path('health-profile/', HealthProfileCreateView.as_view(), name='health-profile-create'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('save-check/', SaveHealthCheckView.as_view(), name='save-check'),
    path('history/', HealthCheckHistoryView.as_view(), name='history'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/update/', UserProfileView.as_view(), name='user-profile-update'),
    path('chef/profile/', ChefProfileView.as_view(), name='chef-profile'),
    path('restaurant/profile/', RestaurantProfileView.as_view(), name='restaurant-profile'),
    path('recipes/add/', RecipeCreateView.as_view(), name='recipe-add'),
    path('recipes/', RecipeListView.as_view(), name='recipe-list'),
    path('recipes/<int:pk>/', RecipeDetailView.as_view(), name='recipe-detail'),
    path('recipes/<int:recipe_id>/comments/', RecipeCommentCreateView.as_view(), name='recipe-comment-add'),
    path('comments/<int:comment_id>/', CommentDetailView.as_view(), name='comment-detail'),
    path('recipes/<int:recipe_id>/like/', ToggleLikeView.as_view(), name='recipe-like'),
    path('chef/<int:chef_id>/', PublicChefProfileView.as_view(), name='public-chef-profile'),
    path('restaurant/<int:restaurant_id>/', PublicRestaurantProfileView.as_view(), name='public-restaurant-profile'),
    path('chef/<int:chef_id>/follow/', ToggleFollowView.as_view(), name='toggle-follow'),
    path('restaurant/<int:restaurant_id>/follow/', ToggleFollowRestaurantView.as_view(), name='toggle-follow-restaurant'),
    path('trainers/<int:trainer_id>/follow/', ToggleFollowTrainerView.as_view(), name='toggle-follow-trainer'),
    path('recipes/<int:recipe_id>/save/', ToggleSaveView.as_view(), name='toggle-save'),
    path('recipes/saved/', SavedRecipesListView.as_view(), name='saved-recipes'),
    path('recipes/saved/restaurants/', SavedRestaurantItemsView.as_view(), name='saved-restaurant-items'),

    # Trainer
    path('trainer/profile/', TrainerProfileView.as_view(), name='trainer-profile'),
    path('trainers/<int:trainer_id>/', PublicTrainerProfileView.as_view(), name='public-trainer-profile'),
    path('trainer/videos/', WorkoutVideoUploadView.as_view(), name='trainer-videos'),
    path('trainer/videos/<int:video_id>/delete/', WorkoutVideoDetailView.as_view(), name='trainer-video-detail'),

    # Public Workouts
    path('workouts/', WorkoutVideoListView.as_view(), name='workout-list'),
    path('workouts/saved/', WorkoutVideoSavedListView.as_view(), name='workout-saved'),
    path('workouts/<int:video_id>/', WorkoutVideoPublicDetail.as_view(), name='workout-detail'),
    path('workouts/<int:video_id>/like/', WorkoutVideoLikeView.as_view(), name='workout-like'),
    path('workouts/<int:video_id>/save/', WorkoutVideoSaveView.as_view(), name='workout-save'),
    path('workouts/<int:video_id>/comments/', WorkoutVideoCommentView.as_view(), name='workout-comments'),
    path('workout-comments/<int:comment_id>/', WorkoutVideoCommentDetailView.as_view(), name='workout-comment-detail'),

    # Community Posts
    path('posts/', PostListCreateView.as_view(), name='post-list-create'),
    path('posts/saved/', SavedCommunityPostsView.as_view(), name='saved-community-posts'),
    path('posts/<int:post_id>/', PostDetailView.as_view(), name='post-detail'),
    path('posts/<int:post_id>/like/', TogglePostLikeView.as_view(), name='post-like'),
    path('posts/<int:post_id>/save/', TogglePostSaveView.as_view(), name='post-save'),
    path('posts/<int:post_id>/comments/', PostCommentListCreateView.as_view(), name='post-comments'),
    path('post-comments/<int:comment_id>/', PostCommentDetailView.as_view(), name='post-comment-detail'),
    
    # Public Profile
    path('profile/<int:user_id>/', PublicProfileView.as_view(), name='public-profile'),
    path('profile/<int:user_id>/follow/', ToggleFollowUserView.as_view(), name='toggle-follow-user'),
    path('search-users/', UserSearchView.as_view(), name='search-users'),
]
