create table if not exists public.blood_connect_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.blood_connect_state enable row level security;

drop policy if exists "BloodConnect shared state public read" on public.blood_connect_state;
drop policy if exists "BloodConnect shared state public insert" on public.blood_connect_state;
drop policy if exists "BloodConnect shared state public update" on public.blood_connect_state;

create policy "BloodConnect shared state public read"
on public.blood_connect_state
for select
to anon
using (true);

create policy "BloodConnect shared state public insert"
on public.blood_connect_state
for insert
to anon
with check (true);

create policy "BloodConnect shared state public update"
on public.blood_connect_state
for update
to anon
using (true)
with check (true);

insert into public.blood_connect_state (id, data, updated_at)
values (
  'main',
  '{
    "users": [
      {
        "id": "admin-id",
        "email": "admin@bloodconnect.org",
        "mobile": "01700000001",
        "name": "System Admin",
        "role": "admin",
        "password": "password",
        "isVerified": true
      },
      {
        "id": "donor-id",
        "email": "donor@bloodconnect.org",
        "mobile": "01700000002",
        "name": "John Donor",
        "role": "donor",
        "password": "password",
        "isVerified": true
      },
      {
        "id": "shopkeeper-id",
        "email": "shopkeeper@bloodconnect.org",
        "mobile": "01700000003",
        "name": "Abir Shopkeeper",
        "role": "shopkeeper",
        "password": "password",
        "isVerified": true
      },
      {
        "id": "viewer-id",
        "email": "viewer@bloodconnect.org",
        "mobile": "01700000004",
        "name": "Tanvir Seeker",
        "role": "viewer",
        "password": "password",
        "isVerified": true
      }
    ],
    "donors": [
      {
        "id": "donor-id",
        "name": "John Donor",
        "bloodType": "O+",
        "phone": "01712345678",
        "address": "Sylhet Sadar",
        "division": "Sylhet",
        "district": "Sylhet",
        "subDistrict": "Sylhet Sadar",
        "area": "Zindabazar",
        "lat": 24.8949,
        "lng": 91.8687,
        "isAvailable": true,
        "donationCount": 5
      }
    ],
    "shops": [
      {
        "id": "shopkeeper-id",
        "name": "Sylhet Central Pharmacy",
        "description": "All kinds of local and imported life saving medicines.",
        "address": "Zindabazar, Sylhet",
        "phone": "01812345678",
        "website": "https://centralpharmacy.com",
        "ownerId": "shopkeeper-id",
        "products": [
          { "name": "Paracetamol", "price": 10 },
          { "name": "Insulin", "price": 450 }
        ],
        "isVerified": true
      }
    ],
    "messages": [],
    "reports": []
  }'::jsonb,
  now()
)
on conflict (id) do nothing;
