from django.db import models
from django.conf import settings


class CodeSnippet(models.Model):
    LANGUAGE_CHOICES = [
        ('python', 'Python'),
        ('javascript', 'JavaScript'),
        ('typescript', 'TypeScript'),
        ('java', 'Java'),
        ('cpp', 'C++'),
        ('c', 'C'),
        ('csharp', 'C#'),
        ('go', 'Go'),
        ('rust', 'Rust'),
        ('php', 'PHP'),
        ('ruby', 'Ruby'),
        ('swift', 'Swift'),
        ('kotlin', 'Kotlin'),
        ('sql', 'SQL'),
        ('html', 'HTML'),
        ('css', 'CSS'),
        ('bash', 'Bash'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='snippets',
    )
    title = models.CharField(max_length=200)
    language = models.CharField(max_length=50, choices=LANGUAGE_CHOICES, default='python')
    code = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Code Snippet'
        verbose_name_plural = 'Code Snippets'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} ({self.language}) — {self.user.username}'


class Explanation(models.Model):
    COMPLEXITY_CHOICES = [
        ('simple', 'Simple'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    snippet = models.ForeignKey(
        CodeSnippet,
        on_delete=models.CASCADE,
        related_name='explanations',
    )
    content = models.TextField(help_text='AI-generated explanation in Markdown format.')
    complexity_level = models.CharField(
        max_length=15,
        choices=COMPLEXITY_CHOICES,
        default='intermediate',
    )
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Explanation'
        verbose_name_plural = 'Explanations'
        ordering = ['-created_at']

    def __str__(self):
        return f'Explanation for "{self.snippet.title}" — {self.complexity_level}'
