-- Update blog post published dates to weekly intervals
-- Starting from most recent and going back one week for each post
WITH numbered_posts AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1 as week_offset
  FROM blog_posts
)
UPDATE blog_posts
SET published_at = (CURRENT_DATE - (numbered_posts.week_offset * INTERVAL '7 days'))::timestamp with time zone
FROM numbered_posts
WHERE blog_posts.id = numbered_posts.id;