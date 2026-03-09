from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html

from .models import CodeSnippet, Explanation


# ──────────────────────────────────────────────────────────────────────────────
# Custom filters
# ──────────────────────────────────────────────────────────────────────────────

class HasExplanationFilter(admin.SimpleListFilter):
    title = 'has explanation'
    parameter_name = 'has_explanation'

    def lookups(self, request, model_admin):
        return [
            ('yes', 'Explained ✔'),
            ('no',  'Not explained yet'),
        ]

    def queryset(self, request, queryset):
        qs = queryset.annotate(exp_count=Count('explanations', distinct=True))
        if self.value() == 'yes':
            return qs.filter(exp_count__gt=0)
        if self.value() == 'no':
            return qs.filter(exp_count=0)
        return queryset


# ──────────────────────────────────────────────────────────────────────────────
# Inlines
# ──────────────────────────────────────────────────────────────────────────────

class ExplanationInline(admin.TabularInline):
    model = Explanation
    extra = 0
    show_change_link = True
    readonly_fields  = ('complexity_badge', 'favorite_badge', 'content_preview', 'created_at')
    fields           = ('complexity_badge', 'favorite_badge', 'content_preview', 'created_at')
    can_delete = True

    @admin.display(description='Complexity')
    def complexity_badge(self, obj):
        colors = {
            'simple':       '#27ae60',
            'intermediate': '#f39c12',
            'advanced':     '#e74c3c',
        }
        color = colors.get(obj.complexity_level, '#999')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:4px;font-size:11px;font-weight:600;">{}</span>',
            color, obj.get_complexity_level_display(),
        )

    @admin.display(description='Favourite')
    def favorite_badge(self, obj):
        if obj.is_favorite:
            return format_html('<span style="color:#f39c12;font-size:16px;">★</span>')
        return format_html('<span style="color:#ccc;font-size:16px;">☆</span>')

    @admin.display(description='Preview')
    def content_preview(self, obj):
        text = obj.content[:120] + '…' if len(obj.content) > 120 else obj.content
        return format_html(
            '<span style="font-family:monospace;font-size:11px;">{}</span>', text
        )


# ──────────────────────────────────────────────────────────────────────────────
# CodeSnippet admin
# ──────────────────────────────────────────────────────────────────────────────

@admin.register(CodeSnippet)
class CodeSnippetAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'language_badge', 'user',
        'explanation_count', 'code_preview', 'created_at',
    )
    list_filter        = ('language', HasExplanationFilter, 'created_at')
    search_fields      = ('title', 'user__username', 'code')
    ordering           = ('-created_at',)
    date_hierarchy     = 'created_at'
    list_per_page      = 20
    list_select_related = ('user',)
    inlines            = [ExplanationInline]
    readonly_fields    = ('created_at', 'explanation_count')
    actions            = ['mark_for_review']

    fieldsets = (
        (None, {'fields': ('user', 'title', 'language')}),
        ('Code', {'fields': ('code',), 'classes': ('wide',)}),
        ('Meta', {'fields': ('created_at', 'explanation_count'), 'classes': ('collapse',)}),
    )

    # ── Computed columns ───────────────────────────────────────────────────

    @admin.display(description='Language', ordering='language')
    def language_badge(self, obj):
        colors = {
            'python': '#3776AB', 'javascript': '#F7DF1E',
            'typescript': '#3178C6', 'java': '#ED8B00',
            'cpp': '#00599C', 'go': '#00ADD8',
            'rust': '#CE422B', 'php': '#777BB4',
        }
        bg    = colors.get(obj.language, '#6c757d')
        label = obj.get_language_display()
        text  = '#000' if obj.language == 'javascript' else '#fff'
        return format_html(
            '<span style="background:{};color:{};padding:2px 8px;'
            'border-radius:4px;font-size:11px;font-weight:700;">{}</span>',
            bg, text, label,
        )

    @admin.display(description='Explanations', ordering='explanation_count')
    def explanation_count(self, obj):
        count = getattr(obj, 'explanation_count', obj.explanations.count())
        if count == 0:
            return format_html('<span style="color:#aaa;">—</span>')
        return format_html(
            '<span style="background:#1abc9c;color:#fff;padding:1px 7px;'
            'border-radius:10px;font-size:12px;">{}</span>', count,
        )

    @admin.display(description='Code preview')
    def code_preview(self, obj):
        preview = obj.code[:80].replace('\n', ' ') + ('…' if len(obj.code) > 80 else '')
        return format_html(
            '<code style="font-size:11px;color:#555;">{}</code>', preview
        )

    def get_queryset(self, request):
        return (
            super().get_queryset(request)
            .annotate(explanation_count=Count('explanations', distinct=True))
        )

    @admin.action(description='📋  Mark selected snippets for review')
    def mark_for_review(self, request, queryset):
        self.message_user(request, f'{queryset.count()} snippet(s) flagged for review.')


# ──────────────────────────────────────────────────────────────────────────────
# Explanation admin
# ──────────────────────────────────────────────────────────────────────────────

@admin.register(Explanation)
class ExplanationAdmin(admin.ModelAdmin):
    list_display   = ('snippet', 'complexity_badge', 'favorite_star', 'content_preview', 'created_at')
    list_filter    = ('complexity_level', 'is_favorite', 'created_at')
    search_fields  = ('snippet__title', 'content', 'snippet__user__username')
    ordering       = ('-created_at',)
    date_hierarchy = 'created_at'
    list_per_page  = 20
    list_select_related = ('snippet', 'snippet__user')
    readonly_fields = ('snippet', 'content', 'created_at')
    actions = ['toggle_favorite']

    fieldsets = (
        (None,   {'fields': ('snippet', 'complexity_level', 'is_favorite')}),
        ('Content', {'fields': ('content',), 'classes': ('wide',)}),
        ('Meta', {'fields': ('created_at',), 'classes': ('collapse',)}),
    )

    @admin.display(description='Complexity', ordering='complexity_level')
    def complexity_badge(self, obj):
        colors = {
            'simple':       '#27ae60',
            'intermediate': '#f39c12',
            'advanced':     '#e74c3c',
        }
        color = colors.get(obj.complexity_level, '#999')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:4px;font-size:11px;font-weight:600;">{}</span>',
            color, obj.get_complexity_level_display(),
        )

    @admin.display(description='★', ordering='is_favorite')
    def favorite_star(self, obj):
        if obj.is_favorite:
            return format_html('<span style="color:#f39c12;font-size:18px;">★</span>')
        return format_html('<span style="color:#ccc;font-size:18px;">☆</span>')

    @admin.display(description='Content preview')
    def content_preview(self, obj):
        text = obj.content[:100] + '…' if len(obj.content) > 100 else obj.content
        return format_html('<span style="font-size:12px;">{}</span>', text)

    @admin.action(description='★  Toggle favourite on selected explanations')
    def toggle_favorite(self, request, queryset):
        for exp in queryset:
            exp.is_favorite = not exp.is_favorite
            exp.save(update_fields=['is_favorite'])
        self.message_user(request, f'{queryset.count()} explanation(s) toggled.')
