"""
Serializers for the custom Admin Panel API.

All serializers here are read-heavy (admins view data), with targeted
write serializers where updates are allowed.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model

from apps.snippets.models import CodeSnippet, Explanation
from apps.ai_chat.models import ChatSession, ChatMessage

User = get_user_model()


# ──────────────────────────────────────────────────────────────────────────────
# User serializers
# ──────────────────────────────────────────────────────────────────────────────

class AdminUserListSerializer(serializers.ModelSerializer):
    """Lightweight user list — shown in the /admin/users/ table."""
    snippet_count = serializers.IntegerField(read_only=True)
    chat_count    = serializers.IntegerField(read_only=True)

    class Meta:
        model  = User
        fields = (
            'id', 'username', 'email',
            'first_name', 'last_name',
            'role', 'is_active', 'is_staff',
            'date_joined', 'last_login',
            'snippet_count', 'chat_count',
        )
        read_only_fields = fields


class AdminUserDetailSerializer(serializers.ModelSerializer):
    """Full user detail — shown on /admin/users/:id."""
    snippet_count = serializers.IntegerField(read_only=True)
    chat_count    = serializers.IntegerField(read_only=True)

    class Meta:
        model  = User
        fields = (
            'id', 'username', 'email',
            'first_name', 'last_name',
            'role', 'is_active', 'is_staff',
            'date_joined', 'last_login',
            'snippet_count', 'chat_count',
        )
        read_only_fields = (
            'id', 'username', 'date_joined', 'last_login',
            'snippet_count', 'chat_count',
        )


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """
    PATCH /api/admin/users/<id>/
    Admins can update: role, is_active, first_name, last_name, email.
    Changing username or password is intentionally excluded.
    """
    class Meta:
        model  = User
        fields = ('email', 'first_name', 'last_name', 'role', 'is_active')


class AdminToggleActiveSerializer(serializers.Serializer):
    """
    POST /api/admin/users/<id>/toggle-active/
    Optionally accepts a reason string (for future audit log).
    """
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=255,
        help_text='Optional reason for blocking/unblocking the user.',
    )


# ──────────────────────────────────────────────────────────────────────────────
# Snippet / Explanation serializers
# ──────────────────────────────────────────────────────────────────────────────

class AdminExplanationInlineSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Explanation
        fields = ('id', 'complexity_level', 'is_favorite', 'created_at')
        read_only_fields = fields


class AdminSnippetSerializer(serializers.ModelSerializer):
    """
    Shown in /admin/snippets/ — includes owner username and explanation count.
    """
    owner           = serializers.CharField(source='user.username', read_only=True)
    owner_id        = serializers.IntegerField(source='user.id',       read_only=True)
    explanation_count = serializers.IntegerField(read_only=True)
    code_preview    = serializers.SerializerMethodField()

    class Meta:
        model  = CodeSnippet
        fields = (
            'id', 'owner', 'owner_id',
            'title', 'language',
            'code_preview', 'explanation_count',
            'created_at',
        )
        read_only_fields = fields

    def get_code_preview(self, obj):
        return obj.code[:120] + '…' if len(obj.code) > 120 else obj.code


class AdminSnippetDetailSerializer(serializers.ModelSerializer):
    """Full snippet detail for admin — includes all explanations."""
    owner        = serializers.CharField(source='user.username', read_only=True)
    owner_id     = serializers.IntegerField(source='user.id',    read_only=True)
    explanations = AdminExplanationInlineSerializer(many=True, read_only=True)

    class Meta:
        model  = CodeSnippet
        fields = (
            'id', 'owner', 'owner_id',
            'title', 'language', 'code',
            'explanations', 'created_at',
        )
        read_only_fields = fields


# ──────────────────────────────────────────────────────────────────────────────
# Chat serializers
# ──────────────────────────────────────────────────────────────────────────────

class AdminChatSessionSerializer(serializers.ModelSerializer):
    """Shown in /admin/chat-sessions/ — includes owner and message count."""
    owner         = serializers.CharField(source='user.username', read_only=True)
    owner_id      = serializers.IntegerField(source='user.id',    read_only=True)
    snippet_title = serializers.SerializerMethodField()
    message_count = serializers.IntegerField(read_only=True)

    class Meta:
        model  = ChatSession
        fields = (
            'id', 'owner', 'owner_id',
            'title', 'snippet_title',
            'message_count', 'created_at',
        )
        read_only_fields = fields

    def get_snippet_title(self, obj):
        return obj.snippet.title if obj.snippet else None


# ──────────────────────────────────────────────────────────────────────────────
# Dashboard stats serializer
# ──────────────────────────────────────────────────────────────────────────────

class AdminStatsSerializer(serializers.Serializer):
    """
    Response shape for GET /api/admin/stats/
    All fields are read-only — this serializer is only used for output.
    """
    total_users        = serializers.IntegerField()
    active_users       = serializers.IntegerField()
    admin_users        = serializers.IntegerField()
    new_users_today    = serializers.IntegerField()

    total_snippets     = serializers.IntegerField()
    snippets_today     = serializers.IntegerField()
    top_language       = serializers.CharField()

    total_explanations = serializers.IntegerField()
    favorited_explanations = serializers.IntegerField()

    total_chat_sessions = serializers.IntegerField()
    total_chat_messages = serializers.IntegerField()

    # Breakdown lists
    snippets_by_language = serializers.ListField(child=serializers.DictField())
    users_joined_last_7_days = serializers.ListField(child=serializers.DictField())
