-- ID FIXES POUR TESTS REPRODUCTIBLES
-- User de test (simulé via auth.uid() dans la réalité, mais ici on insère pour le seed local)
-- NOTE: En prod, il faut remplacer cet ID par le vrai user_id courant
DO $$
DECLARE
  test_user_id uuid := '00000000-0000-0000-0000-000000000000'; -- UUID de test
  project_a_id uuid := gen_random_uuid();
  project_b_id uuid := gen_random_uuid();
  pack_a_id uuid := gen_random_uuid();
  tente_id uuid := gen_random_uuid();
BEGIN

  -- 1. GEAR ITEMS (10 items variés)
  -- Tente (qui sera en conflit)
  insert into public.gear_items (id, user_id, name, weight_g, category, status, brand) values
  (tente_id, test_user_id, 'Hubba Hubba NX', 1720, 'shelter', 'owned', 'MSR');

  -- Autres items
  insert into public.gear_items (user_id, name, weight_g, category, status, brand) values
  (test_user_id, 'Duvet Spark SpII', 560, 'sleep', 'owned', 'Sea to Summit'),
  (test_user_id, 'Matelas NeoAir XLite', 340, 'sleep', 'owned', 'Therm-a-Rest'),
  (test_user_id, 'JetBoil MiniMo', 415, 'kitchen', 'owned', 'JetBoil'),
  (test_user_id, 'Titanium Spoon', 15, 'kitchen', 'owned', 'Toaks'),
  (test_user_id, 'Sawyer Squeeze', 85, 'kitchen', 'owned', 'Sawyer'),
  (test_user_id, 'Talon 44', 1100, 'other', 'owned', 'Osprey'),
  (test_user_id, 'Frontale Spot 400', 80, 'tech', 'owned', 'Black Diamond'),
  (test_user_id, 'Powerbank 10000mAh', 180, 'tech', 'owned', 'Nitecore'),
  (test_user_id, 'Veste Torrenshell', 340, 'wear', 'owned', 'Patagonia');

  -- 2. PROJECTS (Conflit de dates)
  -- Projet A : 10 au 20 Juin
  insert into public.projects (id, user_id, name, start_date, end_date) values
  (project_a_id, test_user_id, 'Expédition Ecrins', '2025-06-10', '2025-06-20');

  -- Projet B : 18 au 25 Juin (Chevauchement du 18 au 20)
  insert into public.projects (id, user_id, name, start_date, end_date) values
  (project_b_id, test_user_id, 'Bivouac Vercors', '2025-06-18', '2025-06-25');

  -- 3. PACK POUR PROJET A
  insert into public.packs (id, project_id, user_id, name) values
  (pack_a_id, project_a_id, test_user_id, 'Sac Principal');

  -- 4. ASSIGNATION TENTE -> PROJET A (Création du conflit potentiel pour B)
  insert into public.pack_items (pack_id, gear_item_id, quantity) values
  (pack_a_id, tente_id, 1);

END $$;
