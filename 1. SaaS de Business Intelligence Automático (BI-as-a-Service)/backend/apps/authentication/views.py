from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from apps.users.serializers import UserSerializer
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User login endpoint."""
    serializer = LoginSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    
    user = serializer.validated_data['user']
    
    # Update last login
    from django.utils import timezone
    user.last_login_at = timezone.now()
    user.save(update_fields=['last_login_at'])
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'user': UserSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """User registration endpoint."""
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    user = serializer.save()
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'user': UserSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def logout_view(request):
    """User logout endpoint."""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logout realizado com sucesso.'})
    except Exception as e:
        return Response(
            {'error': 'Token inválido.'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request_view(request):
    """Request password reset."""
    serializer = PasswordResetRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    # TODO: Implement email sending logic
    # For now, just return success
    
    return Response({
        'message': 'Se o email existir, você receberá instruções para redefinir sua senha.'
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm_view(request):
    """Confirm password reset."""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    # TODO: Implement token validation and password reset logic
    
    return Response({
        'message': 'Senha redefinida com sucesso.'
    })


@api_view(['POST'])
def refresh_token_view(request):
    """Refresh JWT token."""
    try:
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        token = RefreshToken(refresh_token)
        
        return Response({
            'access': str(token.access_token),
        })
    except Exception as e:
        return Response(
            {'error': 'Token inválido ou expirado.'},
            status=status.HTTP_400_BAD_REQUEST
        )
