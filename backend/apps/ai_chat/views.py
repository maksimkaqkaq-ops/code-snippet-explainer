from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers

from .models import ChatSession, ChatMessage
from .serializers import (
    ChatSessionSerializer,
    ChatSessionListSerializer,
    ChatMessageSerializer,
    SendMessageSerializer,
)
from .utils import call_groq, CHAT_SYSTEM_PROMPT


class ChatSessionListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/chat/sessions/   — list all sessions for the current user
    POST /api/chat/sessions/   — create a new session
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ChatSessionListSerializer
        return ChatSessionSerializer

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ChatSessionDetailView(generics.RetrieveDestroyAPIView):
    """
    GET    /api/chat/sessions/<id>/   — retrieve session with full message history
    DELETE /api/chat/sessions/<id>/   — delete session and all its messages
    """
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)


class ChatMessageListView(generics.ListAPIView):
    """GET /api/chat/sessions/<id>/messages/ — list all messages in a session."""
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        session_id = self.kwargs['pk']
        return ChatMessage.objects.filter(
            session__id=session_id,
            session__user=self.request.user,
        )


@extend_schema(
    request=SendMessageSerializer,
    responses=inline_serializer(
        name='SendMessageResponse',
        fields={
            'user_message': ChatMessageSerializer(),
            'assistant_message': ChatMessageSerializer(),
        },
    ),
)
class SendMessageView(APIView):
    """
    POST /api/chat/sessions/<id>/send/
    Saves the user message, builds conversation history, calls Groq,
    saves the assistant reply, and returns both messages.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        # Validate the session belongs to this user
        try:
            session = ChatSession.objects.get(pk=pk, user=request.user)
        except ChatSession.DoesNotExist:
            return Response({'detail': 'Chat session not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Validate input
        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_content = serializer.validated_data['content']

        # Save the user's message first
        user_message = ChatMessage.objects.create(
            session=session,
            role='user',
            content=user_content,
        )

        # Build the full conversation history for Groq
        # Start with the system prompt
        system_prompt = CHAT_SYSTEM_PROMPT

        # If the session is linked to a snippet, prepend snippet context to the system prompt
        if session.snippet:
            snippet = session.snippet
            system_prompt += (
                f"\n\nContext: The user is asking about the following code snippet.\n"
                f"Title: {snippet.title}\n"
                f"Language: {snippet.language}\n"
                f"Code:\n```{snippet.language}\n{snippet.code}\n```"
            )

        messages = [{'role': 'system', 'content': system_prompt}]

        # Add all previous messages in the session (including the one we just saved)
        history = session.messages.order_by('created_at')
        for msg in history:
            messages.append({'role': msg.role, 'content': msg.content})

        # Call Groq
        ai_content = call_groq(messages)

        # Save the assistant reply
        assistant_message = ChatMessage.objects.create(
            session=session,
            role='assistant',
            content=ai_content,
        )

        return Response(
            {
                'user_message': ChatMessageSerializer(user_message).data,
                'assistant_message': ChatMessageSerializer(assistant_message).data,
            },
            status=status.HTTP_201_CREATED,
        )
