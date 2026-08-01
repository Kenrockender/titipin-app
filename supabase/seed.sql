-- Optional demo seed (mirrors lib/mock-data.ts).
insert into trips (name, destination_country, system_exchange_rate, status) values
  ('Tokyo Trip — Aug 2026', 'Japan', 112, 'Active Shopping');

insert into add_ons (name, price_idr) values
  ('Extra Thick Bubble Wrap', 15000),
  ('Gift Box + Ribbon', 25000),
  ('Priority Hand-Carry', 40000);
-- Add catalog_products / users as needed; see lib/mock-data.ts for full examples.
