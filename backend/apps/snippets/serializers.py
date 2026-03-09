from rest_framework import serializers

from .models import CodeSnippet, Explanation


class ExplanationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Explanation
        fields = ('id', 'snippet', 'content', 'complexity_level', 'is_favorite', 'created_at')
        read_only_fields = ('id', 'snippet', 'content', 'created_at')


class CodeSnippetSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    explanations_count = serializers.SerializerMethodField()

    class Meta:
        model = CodeSnippet
        fields = ('id', 'user', 'title', 'language', 'code', 'created_at', 'explanations_count')
        read_only_fields = ('id', 'user', 'created_at', 'explanations_count')

    def get_explanations_count(self, obj):
        return obj.explanations.count()


class CodeSnippetDetailSerializer(CodeSnippetSerializer):
    """Includes nested explanations for the detail endpoint."""
    explanations = ExplanationSerializer(many=True, read_only=True)

    class Meta(CodeSnippetSerializer.Meta):
        fields = CodeSnippetSerializer.Meta.fields + ('explanations',)
