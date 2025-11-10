from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('password-reset/', views.password_reset_request_view, name='password-reset'),
    path('password-reset/confirm/', views.password_reset_confirm_view, name='password-reset-confirm'),
    path('refresh/', views.refresh_token_view, name='refresh-token'),
]
