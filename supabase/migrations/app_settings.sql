-- App Settings tablosu (tek satırlık ayarlar)
create table if not exists app_settings (
  id int primary key default 1 check (id = 1),  -- sadece 1 satır
  email_notifications boolean not null default true,
  updated_at timestamptz default now()
);

-- İlk satırı ekle
insert into app_settings (id, email_notifications) values (1, true) on conflict do nothing;

-- RLS
alter table app_settings enable row level security;

-- Herkes okuyabilir (staff/admin mail durumunu kontrol etmek için)
create policy "Anyone can read settings" on app_settings for select using (true);

-- Sadece admin güncelleyebilir
create policy "Admin can update settings" on app_settings for update using (
  exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  )
);
