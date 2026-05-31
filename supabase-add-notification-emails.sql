-- Müşteri başına birden fazla bildirim e-postası (max 5)
-- JSON array string olarak saklanır, ör: '["a@b.com","c@d.com"]'
-- NULL = bildirim e-postası yok, login e-postasına gönderilir (fallback)

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_emails TEXT DEFAULT NULL;
