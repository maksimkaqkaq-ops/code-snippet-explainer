from django.urls import path

from .views import (
    ChatSessionListCreateView,
    ChatSessionDetailView,
    ChatMessageListView,
    SendMessageView,
)

urlpatterns = [
    path('sessions/', ChatSessionListCreateView.as_view(), name='chat-session-list-create'),
    path('sessions/<int:pk>/', ChatSessionDetailView.as_view(), name='chat-session-detail'),
    path('sessions/<int:pk>/messages/', ChatMessageListView.as_view(), name='chat-message-list'),
    path('sessions/<int:pk>/send/', SendMessageView.as_view(), name='chat-send-message'),
]
