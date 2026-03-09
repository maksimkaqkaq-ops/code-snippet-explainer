from django.urls import path

from .views import (
    SnippetListCreateView,
    SnippetDetailView,
    ExplainSnippetView,
    ExplanationListView,
    ExplanationDetailView,
)

urlpatterns = [
    path('', SnippetListCreateView.as_view(), name='snippet-list-create'),
    path('<int:pk>/', SnippetDetailView.as_view(), name='snippet-detail'),
    path('<int:pk>/explain/', ExplainSnippetView.as_view(), name='snippet-explain'),
    path('<int:pk>/explanations/', ExplanationListView.as_view(), name='snippet-explanations'),
    path('explanations/<int:pk>/', ExplanationDetailView.as_view(), name='explanation-detail'),
]
