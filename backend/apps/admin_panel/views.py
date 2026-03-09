"""
Custom Admin Panel API views.

All views require:
  - IsAuthenticated  (valid JWT token)
  - IsAdminRole      (user.role == 'admin')

These endpoints power the React /admin SPA page.
"""

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiParameter

from apps.snippets.models import CodeSnippet, Explanation
from apps.ai_chat.models import ChatSession, ChatMessage

from .permissions import IsAdminRole
from .serializers import (
    AdminUserListSerializer,
    AdminUserDetailSerializer,
    AdminUserUpdateSerializer,
    AdminToggleActiveSerializer,
    AdminSnippetSerializer,
    AdminSnippetDetailSerializer,
    AdminChatSessionSerializer,
    AdminStatsSerializer,
)

User = get_user_model()

# Shorthand — every admin view uses both permission classes
ADMIN_PERMISSIONS = [IsAuthenticated, IsAdminRole]


# ──────────────────────────────────────────────────────────────────────────────
# Dashboard stats
# ──────────────────────────────────────────────────────────────────────────────

@extend_schema(responses=AdminStatsSerializer)
class AdminStatsView(APIView):
    """
    GET /api/admin/stats/
    Returns aggregate statistics for the admin dashboard:
    user counts, snippet counts by language, chat activity, etc.
    """
    permission_classes = ADMIN_PERMISSIONS

    def get(self, request):
        today     = timezone.now().date()
        week_ago  = timezone.now() - timedelta(days=7)

        # ── User stats ─────────────────────────────────────────────────────
        total_users   = User.objects.count()
        active_users  = User.objects.filter(is_active=True).count()
        admin_users   = User.objects.filter(role='admin').count()
        new_users_today = User.objects.filter(date_joined__date=today).count()

        # ── Snippet stats ──────────────────────────────────────────────────
        total_snippets   = CodeSnippet.objects.count()
        snippets_today   = CodeSnippet.objects.filter(created_at__date=today).count()

        lang_qs = (
            CodeSnippet.objects
            .values('language')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        top_language = lang_qs[0]['language'] if lang_qs else 'N/A'
        snippets_by_language = list(lang_qs)

        # ── Explanation stats ──────────────────────────────────────────────
        total_explanations     = Explanation.objects.count()
        favorited_explanations = Explanation.objects.filter(is_favorite=True).count()

        # ── Chat stats ─────────────────────────────────────────────────────
        total_chat_sessions = ChatSession.objects.count()
        total_chat_messages = ChatMessage.objects.count()

        # ── Users joined last 7 days (for sparkline chart) ─────────────────
        users_last_7 = (
            User.objects
            .filter(date_joined__gte=week_ago)
            .extra(select={'day': "date(date_joined)"})
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )
        users_joined_last_7_days = [
            {'day': str(row['day']), 'count': row['count']}
            for row in users_last_7
        ]

        data = {
            'total_users':        total_users,
            'active_users':       active_users,
            'admin_users':        admin_users,
            'new_users_today':    new_users_today,
            'total_snippets':     total_snippets,
            'snippets_today':     snippets_today,
            'top_language':       top_language,
            'total_explanations': total_explanations,
            'favorited_explanations': favorited_explanations,
            'total_chat_sessions':  total_chat_sessions,
            'total_chat_messages':  total_chat_messages,
            'snippets_by_language':  snippets_by_language,
            'users_joined_last_7_days': users_joined_last_7_days,
        }
        serializer = AdminStatsSerializer(data)
        return Response(serializer.data)


# ──────────────────────────────────────────────────────────────────────────────
# User management
# ──────────────────────────────────────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    """
    GET /api/admin/users/
    Returns ALL users. Supports:
      ?search=<username|email>
      ?role=admin|user
      ?is_active=true|false
    """
    serializer_class   = AdminUserListSerializer
    permission_classes = ADMIN_PERMISSIONS

    def get_queryset(self):
        qs = (
            User.objects
            .annotate(
                snippet_count=Count('snippets',      distinct=True),
                chat_count   =Count('chat_sessions', distinct=True),
            )
            .order_by('-date_joined')
        )

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(username__icontains=search) | Q(email__icontains=search)
            )

        role = self.request.query_params.get('role')
        if role in ('admin', 'user'):
            qs = qs.filter(role=role)

        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')

        return qs


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/admin/users/<id>/   — full user detail with counts
    PATCH  /api/admin/users/<id>/   — update role / is_active / name / email
    DELETE /api/admin/users/<id>/   — permanently delete user
    """
    permission_classes = ADMIN_PERMISSIONS

    def get_queryset(self):
        return (
            User.objects
            .annotate(
                snippet_count=Count('snippets',      distinct=True),
                chat_count   =Count('chat_sessions', distinct=True),
            )
        )

    def get_serializer_class(self):
        if self.request.method in ('PATCH', 'PUT'):
            return AdminUserUpdateSerializer
        return AdminUserDetailSerializer

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        # Prevent admins from deleting themselves
        if user == request.user:
            return Response(
                {'detail': 'You cannot delete your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.delete()
        return Response(
            {'detail': f'User "{user.username}" deleted.'},
            status=status.HTTP_200_OK,
        )


@extend_schema(
    request=AdminToggleActiveSerializer,
    responses={200: AdminUserDetailSerializer},
)
class AdminToggleUserActiveView(APIView):
    """
    POST /api/admin/users/<id>/toggle-active/
    Flips is_active on the target user (block / unblock).
    Returns the updated user object.
    """
    permission_classes = ADMIN_PERMISSIONS

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user == request.user:
            return Response(
                {'detail': 'You cannot deactivate your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])

        action = 'activated' if user.is_active else 'deactivated'
        return Response(
            {
                'detail': f'User "{user.username}" {action}.',
                'is_active': user.is_active,
                'user': AdminUserDetailSerializer(user).data,
            }
        )


@extend_schema(request=AdminUserUpdateSerializer, responses={200: AdminUserDetailSerializer})
class AdminChangeUserRoleView(APIView):
    """
    POST /api/admin/users/<id>/change-role/
    Body: { "role": "admin" | "user" }
    Quickly promote or demote a user without touching other fields.
    """
    permission_classes = ADMIN_PERMISSIONS

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        role = request.data.get('role')
        if role not in ('admin', 'user'):
            return Response(
                {'detail': 'Role must be "admin" or "user".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.role = role
        user.save(update_fields=['role'])
        return Response(
            {
                'detail': f'User "{user.username}" is now "{role}".',
                'user': AdminUserDetailSerializer(user).data,
            }
        )


# ──────────────────────────────────────────────────────────────────────────────
# Snippet moderation
# ──────────────────────────────────────────────────────────────────────────────

class AdminSnippetListView(generics.ListAPIView):
    """
    GET /api/admin/snippets/
    Returns ALL snippets from every user. Supports:
      ?search=<title|username>
      ?language=python|javascript|...
      ?user_id=<int>
    """
    serializer_class   = AdminSnippetSerializer
    permission_classes = ADMIN_PERMISSIONS

    def get_queryset(self):
        qs = (
            CodeSnippet.objects
            .select_related('user')
            .annotate(explanation_count=Count('explanations', distinct=True))
            .order_by('-created_at')
        )

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(title__icontains=search) | Q(user__username__icontains=search)
            )

        language = self.request.query_params.get('language')
        if language:
            qs = qs.filter(language=language)

        user_id = self.request.query_params.get('user_id')
        if user_id:
            qs = qs.filter(user__id=user_id)

        return qs


class AdminSnippetDetailView(generics.RetrieveDestroyAPIView):
    """
    GET    /api/admin/snippets/<id>/   — full snippet with explanations
    DELETE /api/admin/snippets/<id>/   — remove snippet (and its explanations)
    """
    permission_classes = ADMIN_PERMISSIONS

    def get_queryset(self):
        return CodeSnippet.objects.select_related('user').prefetch_related('explanations')

    def get_serializer_class(self):
        return AdminSnippetDetailSerializer

    def destroy(self, request, *args, **kwargs):
        snippet = self.get_object()
        title   = snippet.title
        snippet.delete()
        return Response(
            {'detail': f'Snippet "{title}" and all its explanations deleted.'},
            status=status.HTTP_200_OK,
        )


# ──────────────────────────────────────────────────────────────────────────────
# Chat session moderation
# ──────────────────────────────────────────────────────────────────────────────

class AdminChatSessionListView(generics.ListAPIView):
    """
    GET /api/admin/chat-sessions/
    Returns ALL chat sessions from every user. Supports:
      ?search=<title|username>
      ?user_id=<int>
    """
    serializer_class   = AdminChatSessionSerializer
    permission_classes = ADMIN_PERMISSIONS

    def get_queryset(self):
        qs = (
            ChatSession.objects
            .select_related('user', 'snippet')
            .annotate(message_count=Count('messages', distinct=True))
            .order_by('-created_at')
        )

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(title__icontains=search) | Q(user__username__icontains=search)
            )

        user_id = self.request.query_params.get('user_id')
        if user_id:
            qs = qs.filter(user__id=user_id)

        return qs


class AdminChatSessionDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/admin/chat-sessions/<id>/
    Removes a chat session and all its messages.
    """
    serializer_class   = AdminChatSessionSerializer
    permission_classes = ADMIN_PERMISSIONS

    def get_queryset(self):
        return ChatSession.objects.all()

    def destroy(self, request, *args, **kwargs):
        session = self.get_object()
        title   = session.title
        session.delete()
        return Response(
            {'detail': f'Chat session "{title}" and all its messages deleted.'},
            status=status.HTTP_200_OK,
        )
