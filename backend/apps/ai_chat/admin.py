from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html

from .models import ChatSession, ChatMessage


# ──────────────────────────────────────────────────────────────────────────────
# Custom filters
# ──────────────────────────────────────────────────────────────────────────────

class MessageCountFilter(admin.SimpleListFilter):
    title = 'conversation length'
    parameter_name = 'msg_count'

    def lookups(self, request, model_admin):
        return [
            ('empty', 'Empty (0 messages)'),
            ('short', 'Short (1–4)'),
            ('medium', 'Medium (5–15)'),
            ('long', 'Long (15+)'),
        ]

    def queryset(self, request, queryset):
        qs = queryset.annotate(mc=Count('messages', distinct=True))
        mapping = {
            'empty':  qs.filter(mc=0),
            'short':  qs.filter(mc__gte=1,  mc__lte=4),
            'medium': qs.filter(mc__gte=5,  mc__lte=15),
            'long':   qs.filter(mc__gt=15),
        }
        return mapping.get(self.value(), queryset)


class LinkedSnippetFilter(admin.SimpleListFilter):
    title = 'linked to snippet'
    parameter_name = 'has_snippet'

    def lookups(self, request, model_admin):
        return [('yes', 'Yes'), ('no', 'No')]

    def queryset(self, request, queryset):
        if self.value() == 'yes':
            return queryset.filter(snippet__isnull=False)
        if self.value() == 'no':
            return queryset.filter(snippet__isnull=True)
        return queryset


# ──────────────────────────────────────────────────────────────────────────────
# Inlines
# ──────────────────────────────────────────────────────────────────────────────

class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ('role_badge', 'content_preview', 'created_at')
    fields          = ('role_badge', 'content_preview', 'created_at')
    can_delete = False
    max_num    = 30          # cap inline display to avoid very long pages

    @admin.display(description='Role')
    def role_badge(self, obj):
        if obj.role == 'user':
            return format_html(
                '<span style="background:#3498db;color:#fff;padding:2px 8px;'
                'border-radius:4px;font-size:11px;font-weight:600;">User</span>'
            )
        return format_html(
            '<span style="background:#8e44ad;color:#fff;padding:2px 8px;'
            'border-radius:4px;font-size:11px;font-weight:600;">AI</span>'
        )

    @admin.display(description='Content')
    def content_preview(self, obj):
        text = obj.content[:150] + '…' if len(obj.content) > 150 else obj.content
        return format_html('<span style="font-size:12px;">{}</span>', text)


# ──────────────────────────────────────────────────────────────────────────────
# ChatSession admin
# ──────────────────────────────────────────────────────────────────────────────

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'user', 'snippet_link',
        'message_count_badge', 'created_at',
    )
    list_filter        = (MessageCountFilter, LinkedSnippetFilter, 'created_at')
    search_fields      = ('title', 'user__username', 'snippet__title')
    ordering           = ('-created_at',)
    date_hierarchy     = 'created_at'
    list_per_page      = 20
    list_select_related = ('user', 'snippet')
    readonly_fields    = ('created_at', 'message_count_badge')
    inlines            = [ChatMessageInline]
    actions            = ['clear_messages']

    fieldsets = (
        (None,   {'fields': ('user', 'title', 'snippet')}),
        ('Meta', {'fields': ('created_at', 'message_count_badge'), 'classes': ('collapse',)}),
    )

    @admin.display(description='Snippet')
    def snippet_link(self, obj):
        if obj.snippet:
            return format_html(
                '<span style="background:#e8f4fd;padding:2px 6px;'
                'border-radius:3px;font-size:12px;">📎 {}</span>',
                obj.snippet.title,
            )
        return format_html('<span style="color:#aaa;">—</span>')

    @admin.display(description='Messages', ordering='message_count')
    def message_count_badge(self, obj):
        count = getattr(obj, 'message_count', obj.messages.count())
        if count == 0:
            return format_html('<span style="color:#aaa;">0</span>')
        color = '#3498db' if count < 10 else '#8e44ad'
        return format_html(
            '<span style="background:{};color:#fff;padding:1px 8px;'
            'border-radius:10px;font-size:12px;font-weight:600;">{}</span>',
            color, count,
        )

    def get_queryset(self, request):
        return (
            super().get_queryset(request)
            .annotate(message_count=Count('messages', distinct=True))
        )

    @admin.action(description='🗑  Delete all messages in selected sessions')
    def clear_messages(self, request, queryset):
        total = 0
        for session in queryset:
            n, _ = session.messages.all().delete()
            total += n
        self.message_user(request, f'{total} message(s) deleted from {queryset.count()} session(s).')


# ──────────────────────────────────────────────────────────────────────────────
# ChatMessage admin
# ──────────────────────────────────────────────────────────────────────────────

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display   = ('session', 'role_badge', 'content_preview', 'created_at')
    list_filter    = ('role', 'created_at')
    search_fields  = ('content', 'session__title', 'session__user__username')
    ordering       = ('-created_at',)
    date_hierarchy = 'created_at'
    list_per_page  = 30
    list_select_related = ('session', 'session__user')
    readonly_fields = ('session', 'role', 'content', 'created_at')

    fieldsets = (
        (None, {'fields': ('session', 'role')}),
        ('Message', {'fields': ('content',), 'classes': ('wide',)}),
        ('Meta',    {'fields': ('created_at',), 'classes': ('collapse',)}),
    )

    @admin.display(description='Role', ordering='role')
    def role_badge(self, obj):
        if obj.role == 'user':
            return format_html(
                '<span style="background:#3498db;color:#fff;padding:2px 8px;'
                'border-radius:4px;font-size:11px;font-weight:600;">User</span>'
            )
        return format_html(
            '<span style="background:#8e44ad;color:#fff;padding:2px 8px;'
            'border-radius:4px;font-size:11px;font-weight:600;">AI</span>'
        )

    @admin.display(description='Content')
    def content_preview(self, obj):
        text = obj.content[:100] + '…' if len(obj.content) > 100 else obj.content
        return format_html('<span style="font-size:12px;">{}</span>', text)
