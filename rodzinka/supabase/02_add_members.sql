-- =====================================================================
-- Przypisanie Waszych dwóch kont do rodziny.
--
-- Uruchom DOPIERO, gdy oba konta są już w Authentication -> Users.
-- Podmień dwa adresy e-mail i imiona poniżej, potem Run.
-- =====================================================================

insert into public.family_members (user_id, family_id, display_name)
select u.id, (select id from public.families limit 1), m.display_name
from (values
  ('TWOJ_EMAIL@example.com', 'Tata'),
  ('EMAIL_ZONY@example.com', 'Mama')
) as m(email, display_name)
join auth.users u on lower(u.email) = lower(m.email);

-- Sprawdzenie: powinny pojawić się 2 wiersze.
select fm.display_name, u.email
from public.family_members fm
join auth.users u on u.id = fm.user_id;
