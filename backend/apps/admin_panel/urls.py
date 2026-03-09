from django.urls import path

from .views import (
    AdminStatsView,
    AdminUserListView,
    AdminUserDetailView,
    AdminToggleUserActiveView,
    AdminChangeUserRoleView,
    AdminSnippetListView,
    AdminSnippetDetailView,
    AdminChatSessionListView,
    AdminChatSessionDeleteView,
)

urlpatterns = [
    # ── Dashboard ────────────────────────────────────────────────────────
    path('stats/',                          AdminStatsView.as_view(),              name='admin-stats'),

    # ── User management ──────────────────────────────────────────────────
    path('users/',                          AdminUserListView.as_view(),           name='admin-user-list'),
    path('users/<int:pk>/',                 AdminUserDetailView.as_view(),         name='admin-user-detail'),
    path('users/<int:pk>/toggle-active/',   AdminToggleUserActiveView.as_view(),   name='admin-user-toggle-active'),
    path('users/<int:pk>/change-role/',     AdminChangeUserRoleView.as_view(),     name='admin-user-change-role'),

    # ── Snippet moderation ───────────────────────────────────────────────
    path('snippets/',                       AdminSnippetListView.as_view(),        name='admin-snippet-list'),
    path('snippets/<int:pk>/',              AdminSnippetDetailView.as_view(),      name='admin-snippet-detail'),

    # ── Chat session moderation ──────────────────────────────────────────
    path('chat-sessions/',                  AdminChatSessionListView.as_view(),    name='admin-chat-session-list'),
    path('chat-sessions/<int:pk>/',         AdminChatSessionDeleteView.as_view(),  name='admin-chat-session-delete'),
]
