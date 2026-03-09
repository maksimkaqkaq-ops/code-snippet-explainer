from rest_framework import generics, status, serializers as drf_serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, inline_serializer

from .models import CodeSnippet, Explanation
from .serializers import CodeSnippetSerializer, CodeSnippetDetailSerializer, ExplanationSerializer
from apps.ai_chat.utils import call_groq, EXPLAIN_SYSTEM_PROMPT


class SnippetListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/snippets/      — list all snippets owned by the current user
    POST /api/snippets/      — create a new snippet
    """
    serializer_class = CodeSnippetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CodeSnippet.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SnippetDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/snippets/<id>/   — retrieve snippet with its explanations
    PUT    /api/snippets/<id>/   — full update
    PATCH  /api/snippets/<id>/   — partial update
    DELETE /api/snippets/<id>/   — delete
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only access their own snippets
        return CodeSnippet.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return CodeSnippetDetailSerializer
        return CodeSnippetSerializer


@extend_schema(
    request=inline_serializer(
        name='ExplainRequest',
        fields={'complexity_level': drf_serializers.ChoiceField(
            choices=['simple', 'intermediate', 'advanced'],
            default='intermediate',
            required=False,
        )},
    ),
    responses=ExplanationSerializer,
)
class ExplainSnippetView(APIView):
    """
    POST /api/snippets/<id>/explain/
    Calls the Groq API to generate an explanation for the snippet,
    saves it as an Explanation object, and returns it.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            snippet = CodeSnippet.objects.get(pk=pk, user=request.user)
        except CodeSnippet.DoesNotExist:
            return Response({'detail': 'Snippet not found.'}, status=status.HTTP_404_NOT_FOUND)

        complexity = request.data.get('complexity_level', 'intermediate')
        if complexity not in ('simple', 'intermediate', 'advanced'):
            complexity = 'intermediate'

        # Build the user prompt
        user_prompt = (
            f"Language: {snippet.language}\n"
            f"Title: {snippet.title}\n"
            f"Complexity level requested: {complexity}\n\n"
            f"```{snippet.language}\n{snippet.code}\n```"
        )

        messages = [
            {'role': 'system', 'content': EXPLAIN_SYSTEM_PROMPT},
            {'role': 'user', 'content': user_prompt},
        ]

        ai_content = call_groq(messages)

        explanation = Explanation.objects.create(
            snippet=snippet,
            content=ai_content,
            complexity_level=complexity,
        )

        return Response(ExplanationSerializer(explanation).data, status=status.HTTP_201_CREATED)


class ExplanationListView(generics.ListAPIView):
    """GET /api/snippets/<id>/explanations/ — list all explanations for a snippet."""
    serializer_class = ExplanationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        snippet_id = self.kwargs['pk']
        return Explanation.objects.filter(
            snippet__id=snippet_id,
            snippet__user=self.request.user,
        )


class ExplanationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/explanations/<id>/   — retrieve explanation
    PATCH  /api/explanations/<id>/   — toggle is_favorite, update complexity_level
    DELETE /api/explanations/<id>/   — delete explanation
    """
    serializer_class = ExplanationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Explanation.objects.filter(snippet__user=self.request.user)
