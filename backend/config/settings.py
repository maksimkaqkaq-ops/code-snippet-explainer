from pathlib import Path
from datetime import timedelta
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'jazzmin',                          # must be before django.contrib.admin
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',

    # Local apps
    'apps.users',
    'apps.snippets',
    'apps.ai_chat',
    'apps.admin_panel',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',       # must be before CommonMiddleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# --- Database -----------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='snippets_db'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='postgres'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# --- Auth ---------------------------------------------------------------
AUTH_USER_MODEL = 'users.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# --- Internationalisation -----------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# --- Static & Media -----------------------------------------------------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- Django REST Framework ----------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# --- SimpleJWT ----------------------------------------------------------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# --- CORS ---------------------------------------------------------------
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://localhost:5173',
    cast=Csv(),
)
CORS_ALLOW_CREDENTIALS = True

# --- drf-spectacular (Swagger) ------------------------------------------
SPECTACULAR_SETTINGS = {
    'TITLE': 'Code Snippet Explainer API',
    'DESCRIPTION': 'Backend API for explaining code snippets using AI (Groq / llama-3.1-8b-instant).',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
}

# --- Groq ---------------------------------------------------------------
GROQ_API_KEY = config('GROQ_API_KEY', default='')

# --- Jazzmin ------------------------------------------------------------
JAZZMIN_SETTINGS = {
    # ── Branding ──────────────────────────────────────────────────────────
    'site_title':   'CSE Admin',
    'site_header':  'Code Snippet Explainer',
    'site_brand':   'CSE',
    'welcome_sign': 'Welcome to the Code Snippet Explainer Admin',
    'copyright':    'Code Snippet Explainer',

    # ── Search ────────────────────────────────────────────────────────────
    'search_model': ['users.User', 'snippets.CodeSnippet'],

    # ── Top navigation bar links ──────────────────────────────────────────
    'topmenu_links': [
        {'name': 'Dashboard',  'url': 'admin:index',           'permissions': ['auth.view_user']},
        {'name': 'Users',      'model': 'users.User'},
        {'name': 'Snippets',   'model': 'snippets.CodeSnippet'},
        {'name': 'API Docs',   'url': '/api/schema/swagger-ui/', 'new_window': True},
    ],

    # ── User menu (top-right avatar dropdown) ────────────────────────────
    'usermenu_links': [
        {'name': 'API Docs', 'url': '/api/schema/swagger-ui/', 'new_window': True, 'icon': 'fas fa-book'},
        {'model': 'users.User'},
    ],

    # ── Sidebar icons ─────────────────────────────────────────────────────
    'icons': {
        'auth':                  'fas fa-users-cog',
        'users.user':            'fas fa-user-circle',
        'snippets.codesnippet':  'fas fa-code',
        'snippets.explanation':  'fas fa-lightbulb',
        'ai_chat.chatsession':   'fas fa-comments',
        'ai_chat.chatmessage':   'fas fa-comment-dots',
    },
    'default_icon_parents':  'fas fa-chevron-circle-right',
    'default_icon_children': 'fas fa-circle',

    # ── Layout & behaviour ────────────────────────────────────────────────
    'related_modal_active':  True,      # open FK pickers in a modal
    'show_sidebar':          True,
    'navigation_expanded':   True,
    'changeform_format':     'horizontal_tabs',   # tabbed edit forms
    'changeform_format_overrides': {
        'users.user':           'collapsible',
        'snippets.codesnippet': 'horizontal_tabs',
        'ai_chat.chatsession':  'horizontal_tabs',
    },

    # ── App / model ordering ──────────────────────────────────────────────
    'order_with_respect_to': [
        'users', 'users.user',
        'snippets', 'snippets.codesnippet', 'snippets.explanation',
        'ai_chat', 'ai_chat.chatsession', 'ai_chat.chatmessage',
    ],
    'hide_apps':   [],
    'hide_models': [],

    # ── Misc ──────────────────────────────────────────────────────────────
    'show_ui_builder': False,   # set True to get the live UI tweaks panel
}

JAZZMIN_UI_TWEAKS = {
    'navbar_small_text':   False,
    'footer_small_text':   False,
    'body_small_text':     False,
    'brand_small_text':    False,
    'brand_colour':        'navbar-dark',
    'accent':              'accent-primary',
    'navbar':              'navbar-dark',
    'no_navbar_border':    True,
    'navbar_fixed':        True,
    'layout_boxed':        False,
    'footer_fixed':        False,
    'sidebar_fixed':       True,
    'sidebar':             'sidebar-dark-primary',
    'sidebar_nav_small_text':   False,
    'sidebar_disable_expand':   False,
    'sidebar_nav_child_indent': True,
    'sidebar_nav_compact_style': False,
    'sidebar_nav_legacy_style':  False,
    'sidebar_nav_flat_style':    False,
    'theme':               'default',
    'dark_mode_theme':     None,
    'button_classes': {
        'primary':   'btn-primary',
        'secondary': 'btn-secondary',
        'info':      'btn-info',
        'warning':   'btn-warning',
        'danger':    'btn-danger',
        'success':   'btn-success',
    },
}
