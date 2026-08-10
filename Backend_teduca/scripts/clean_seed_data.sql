-- Script para eliminar profesores de demostración de la BD de producción.
-- EJECUTAR SOLO EN PRODUCCIÓN cuando estés listo para limpiar datos mock.
-- Antes de ejecutar: verifica que no haya usuarios reales con emails @teduca.dev
--
-- Uso: psql $DATABASE_URL -f scripts/clean_seed_data.sql

BEGIN;

-- Identifica los usuarios seed (todos tienen email @teduca.dev y auth_provider='seed')
SELECT id, email, name FROM users WHERE email LIKE '%@teduca.dev' AND auth_provider = 'seed';

-- Elimina en cascada: las FKs con ON DELETE CASCADE eliminan automáticamente
-- teacher_profiles, marketplace_courses, favorites, swipes, reservations, chat_threads.
DELETE FROM users WHERE email LIKE '%@teduca.dev' AND auth_provider = 'seed';

-- Verifica que no quedaron residuos
SELECT COUNT(*) AS remaining_seed_users FROM users WHERE auth_provider = 'seed';

COMMIT;
