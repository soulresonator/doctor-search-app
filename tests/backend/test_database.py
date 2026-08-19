import django
from django.conf import settings
from django.db import connection


def test_database_engine_is_postgresql():
    assert settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql'


def test_database_connection(db):
    # db fixture ensures Django can connect and the test DB is set up
    with connection.cursor() as cursor:
        cursor.execute('SELECT 1')
        result = cursor.fetchone()
    assert result == (1,)
