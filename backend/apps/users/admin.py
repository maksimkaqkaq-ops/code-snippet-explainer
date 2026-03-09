from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.db.models import Count
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

from .models import User


# ──────────────────────────────────────────────────────────────────────────────
# Custom filters
# ──────────────────────────────────────────────────────────────────────────────

class SnippetActivityFilter(admin.SimpleListFilter):
    title = 'snippet activity'
    parameter_name = 'snippet_activity'

    def lookups(self, request, model_admin):
        return [
            ('none',   'No snippets'),
            ('low',    '1 – 5 snippets'),
            ('medium', '6 – 20 snippets'),
            ('high',   '20+ snippets'),
        ]

    def queryset(self, request, queryset):
        qs = queryset.annotate(sc=Count('snippets', distinct=True))
        mapping = {
            'none':   qs.filter(sc=0),
            'low':    qs.filter(sc__gte=1,  sc__lte=5),
            'medium': qs.filter(sc__gte=6,  sc__lte=20),
            'high':   qs.filter(sc__gt=20),
        }
        return mapping.get(self.value(), queryset)


# ──────────────────────────────────────────────────────────────────────────────
# User admin
# ──────────────────────────────────────────────────────────────────────────────

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        'username', 'email',
        'role_badge', 'active_badge',
        'snippet_count', 'chat_count',
        'date_joined',
    )
    list_filter   = ('role', 'is_active', 'is_staff', SnippetActivityFilter)
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering      = ('-date_joined',)
    date_hierarchy = 'date_joined'
    list_per_page  = 25
    list_select_related = True
    show_full_result_count = True
    actions = ['make_admin', 'make_user', 'activate_users', 'deactivate_users']

    fieldsets = UserAdmin.fieldsets + (
        (_('Role'), {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (_('Role'), {'fields': ('role',)}),
    )

    # ── Computed / display columns ─────────────────────────────────────────

    @admin.display(description='Role', ordering='role')
    def role_badge(self, obj):
        color = '#e74c3c' if obj.role == 'admin' else '#3498db'
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 9px;'
            'border-radius:4px;font-size:11px;font-weight:700;">{}</span>',
            color, obj.get_role_display(),
        )

    @admin.display(description='Active', ordering='is_active', boolean=False)
    def active_badge(self, obj):
        if obj.is_active:
            return format_html('<span style="color:#27ae60;font-size:16px;">✔</span>')
        return format_html('<span style="color:#e74c3c;font-size:16px;">✘</span>')

    @admin.display(description='Snippets', ordering='snippet_count')
    def snippet_count(self, obj):
        return obj.snippet_count

    @admin.display(description='Chats', ordering='chat_count')
    def chat_count(self, obj):
        return obj.chat_count

    def get_queryset(self, request):
        return (
            super().get_queryset(request)
            .annotate(
                snippet_count=Count('snippets',      distinct=True),
                chat_count   =Count('chat_sessions', distinct=True),
            )
        )

    # ── Bulk actions ───────────────────────────────────────────────────────

    @admin.action(description='🔑  Promote selected → Admin role')
    def make_admin(self, request, queryset):
        n = queryset.update(role='admin')
        self.message_user(request, f'{n} user(s) promoted to Admin.')

    @admin.action(description='👤  Demote selected → User role')
    def make_user(self, request, queryset):
        n = queryset.update(role='user')
        self.message_user(request, f'{n} user(s) demoted to User.')

    @admin.action(description='✅  Activate selected users')
    def activate_users(self, request, queryset):
        n = queryset.update(is_active=True)
        self.message_user(request, f'{n} user(s) activated.')

    @admin.action(description='🚫  Deactivate selected users')
    def deactivate_users(self, request, queryset):
        n = queryset.update(is_active=False)
        self.message_user(request, f'{n} user(s) deactivated.')
