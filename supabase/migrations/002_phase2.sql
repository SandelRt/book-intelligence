-- ─────────────────────────────────────────────
-- Phase 2: genericness_score + reference seed data
-- ─────────────────────────────────────────────

-- Add genericness_score to chapters
alter table chapters
  add column if not exists genericness_score float;

-- ─────────────────────────────────────────────
-- Seed reference library (media_references)
-- ─────────────────────────────────────────────
insert into media_references (type, title, author_director, genre_tags, structure_meta) values

('book', 'No Country for Old Men', 'Cormac McCarthy',
 array['thriller', 'literary fiction', 'crime', 'western'],
 '{"themes":["fate","evil","moral decay","aging"],"tone":"bleak and sparse","act_structure":"parallel narratives converge at midpoint; final act deliberately withholds climax","notable_for":"sparse dialogue, existential dread, subverted genre expectations"}'::jsonb),

('book', 'The Road', 'Cormac McCarthy',
 array['literary fiction', 'post-apocalyptic', 'survival'],
 '{"themes":["survival","fatherhood","hope","moral endurance"],"tone":"stark and lyrical","act_structure":"episodic journey, no traditional three acts; escalating bleakness with redemptive ending","notable_for":"stripped prose, recurring imagery, emotional devastation through restraint"}'::jsonb),

('book', 'Never Let Me Go', 'Kazuo Ishiguro',
 array['literary fiction', 'dystopia', 'coming of age'],
 '{"themes":["mortality","identity","memory","complicity"],"tone":"quiet and unsettling","act_structure":"non-linear narration; revelation delivered late; Act 2 is the emotional heart","notable_for":"unreliable narrator, slow-burn dread, emotional understatement"}'::jsonb),

('book', 'Gone Girl', 'Gillian Flynn',
 array['thriller', 'mystery', 'domestic noir'],
 '{"themes":["marriage","identity","media","manipulation"],"tone":"dark and sardonic","act_structure":"dual POV; midpoint twist recontextualizes Act 1; Act 3 escalates rapidly","notable_for":"unreliable dual narrators, dark humor, sharp social commentary"}'::jsonb),

('book', 'Their Eyes Were Watching God', 'Zora Neale Hurston',
 array['literary fiction', 'romance', 'coming of age', 'historical'],
 '{"themes":["self-discovery","love","voice","freedom"],"tone":"lyrical and warm","act_structure":"framed narrative; three love stories in sequence; emotional climax in Act 3","notable_for":"dialect as voice, lush imagery, female interiority, oral storytelling rhythm"}'::jsonb),

('book', 'The Remains of the Day', 'Kazuo Ishiguro',
 array['literary fiction', 'historical', 'character study'],
 '{"themes":["regret","duty","repression","dignity"],"tone":"restrained and melancholic","act_structure":"road-trip frame; memories surface episodically; emotional revelation deferred to final pages","notable_for":"unreliable first-person, what is not said, English restraint as character trait"}'::jsonb),

('book', 'Sharp Objects', 'Gillian Flynn',
 array['thriller', 'mystery', 'psychological', 'domestic noir'],
 '{"themes":["trauma","mother-daughter","small town secrets","self-destruction"],"tone":"claustrophobic and dark","act_structure":"investigative structure with personal stakes escalating; twist embedded in overlooked detail","notable_for":"body as text, unreliable narrator, Southern Gothic atmosphere"}'::jsonb),

('book', 'Beloved', 'Toni Morrison',
 array['literary fiction', 'historical', 'horror'],
 '{"themes":["slavery","trauma","memory","love","haunting"],"tone":"fragmented and incantatory","act_structure":"non-linear; trauma revealed in pieces; haunting presence as structural device","notable_for":"fragmented chronology, lyrical prose, embodied trauma, communal voice"}'::jsonb),

('book', 'The Kite Runner', 'Khaled Hosseini',
 array['literary fiction', 'coming of age', 'historical', 'redemption'],
 '{"themes":["guilt","redemption","friendship","war","fatherhood"],"tone":"intimate and devastating","act_structure":"inciting wound in Act 1; decades-long consequence; Act 3 return and redemption arc","notable_for":"first-person retrospective guilt, parallel father-son structures, cultural specificity"}'::jsonb),

('book', 'Ordinary People', 'Judith Guest',
 array['literary fiction', 'family drama', 'psychological'],
 '{"themes":["grief","guilt","family dysfunction","therapy","control"],"tone":"quiet and precise","act_structure":"dual POV (father and son); parallel arcs toward breakdown and recovery; emotional not external climax","notable_for":"internal POV depth, understatement of trauma, suburban specificity"}'::jsonb);
