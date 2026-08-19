from django.conf import settings


def test_django_settings_loads():
    assert settings.configured


def test_secret_key_not_default():
    assert not settings.SECRET_KEY.startswith('django-insecure')


def test_installed_apps_contains_custom_apps():
    assert 'apps.users' in settings.INSTALLED_APPS
    assert 'apps.doctors' in settings.INSTALLED_APPS


def test_rest_framework_in_installed_apps():
    assert 'rest_framework' in settings.INSTALLED_APPS


def test_auth_user_model_set():
    assert settings.AUTH_USER_MODEL == 'users.User'
