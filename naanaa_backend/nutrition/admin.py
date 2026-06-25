from django.contrib import admin
from .models import (
    HealthProfile, HealthCheck, UserProfile,
    ChefProfile, Recipe, TrainerProfile, WorkoutVideo, WorkoutVideoComment
)

admin.site.register(HealthProfile)
admin.site.register(HealthCheck)
admin.site.register(UserProfile)
admin.site.register(ChefProfile)
admin.site.register(Recipe)

@admin.register(TrainerProfile)
class TrainerProfileAdmin(admin.ModelAdmin):
    list_display  = ('user', 'specialization', 'experience_years', 'license_number', 'is_verified', 'created_at')
    list_filter   = ('specialization', 'is_verified')
    search_fields = ('user__username', 'license_number')
    list_editable = ('is_verified',)

@admin.register(WorkoutVideo)
class WorkoutVideoAdmin(admin.ModelAdmin):
    list_display  = ('title', 'trainer', 'difficulty', 'burned_calories', 'duration', 'is_active', 'created_at')
    list_filter   = ('difficulty', 'is_active')
    search_fields = ('title', 'trainer__user__username')
    list_editable = ('is_active',)

@admin.register(WorkoutVideoComment)
class WorkoutVideoCommentAdmin(admin.ModelAdmin):
    list_display  = ('user', 'video', 'text', 'created_at')
    search_fields = ('user__username', 'video__title', 'text')
    list_filter   = ('created_at',)

