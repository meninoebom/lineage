# Admin Moderation Guide

Moderation is handled through the Supabase dashboard. No custom admin UI is needed for V1.

## Delete a Testimony

1. Go to Supabase Dashboard → Table Editor → `testimonies`
2. Find the testimony by `resource_slug`, `user_id`, or `created_at`
3. Click the row → Delete

This is a hard delete. The testimony is permanently removed.

## Ban a User

1. Go to Supabase Dashboard → Table Editor → `profiles`
2. Find the user by `display_name` or `id`
3. Set `banned` to `true`

Banned users:
- Cannot submit new testimonies (blocked by RLS policy)
- See a "Your account has been restricted" message if they try
- Existing testimonies remain visible (delete them manually if needed)

## Unban a User

Set `profiles.banned` back to `false` in the Table Editor.

## Identify Spam

Signs to look for:
- Multiple testimonies created in rapid succession
- Generic or nonsensical text
- Same text across different resources
- Suspicious email addresses in `auth.users`

## Useful SQL Queries

Run these in the Supabase SQL Editor:

```sql
-- Recent testimonies (last 7 days)
select t.*, p.display_name, p.banned
from testimonies t
join profiles p on t.user_id = p.id
where t.created_at > now() - interval '7 days'
order by t.created_at desc;

-- Most active users
select p.id, p.display_name, count(t.id) as testimony_count
from profiles p
join testimonies t on p.id = t.user_id
group by p.id, p.display_name
order by testimony_count desc
limit 20;

-- All testimonies by a specific user
select * from testimonies where user_id = 'USER_ID_HERE';
```
