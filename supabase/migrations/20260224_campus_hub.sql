-- Create campus_news table
CREATE TABLE IF NOT EXISTS public.campus_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campus_events table
CREATE TABLE IF NOT EXISTS public.campus_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  image_url TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  organizer TEXT NOT NULL,
  capacity INTEGER,
  registration_url TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.campus_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_events ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Anyone can view campus news" ON public.campus_news FOR SELECT USING (true);
CREATE POLICY "Anyone can view campus events" ON public.campus_events FOR SELECT USING (true);

-- content_likes table (if not already exists)
CREATE TABLE IF NOT EXISTS public.content_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

ALTER TABLE public.content_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view likes" ON public.content_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create likes" ON public.content_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.content_likes FOR DELETE USING (auth.uid() = user_id);

-- Sample campus news
INSERT INTO public.campus_news (title, summary, content, category, author, image_url) VALUES
('New Research Centre Opens at Campus', 'The university has officially launched a state-of-the-art research centre focused on AI and data science.', 'The university has officially launched a state-of-the-art research centre focused on artificial intelligence and data science. The centre, funded by a R50 million grant, will support postgraduate research and industry partnerships. Students are encouraged to apply for research assistant positions.', 'Academic', 'Campus Communications', 'https://images.unsplash.com/photo-1562774053-701939374585?w=800'),
('Student Union Elections Results Announced', 'The results of the 2025 Student Union elections have been announced. Meet your new student leaders.', 'After a week of campaigning and voting, the Student Union has announced the results of the 2025 elections. The new president is Thabo Mokoena from the Faculty of Commerce, who ran on a platform of improved student services and mental health support. The full list of elected representatives is available on the student portal.', 'Social', 'Student Affairs Office', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800'),
('Library Extended Hours During Exam Period', 'The main campus library will extend its operating hours during the upcoming examination period.', 'To support students during the examination period, the main campus library will extend its operating hours. From 15 November to 15 December, the library will be open from 07:00 to 23:00 on weekdays and 08:00 to 20:00 on weekends. Additional study spaces have also been made available in the student centre.', 'Academic', 'Library Services', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800'),
('Campus Sports Team Wins National Championship', 'Our football team has brought home the national university championship trophy after a thrilling final.', 'In a thrilling final match played at Ellis Park Stadium, our university football team defeated the University of Pretoria 2-1 to claim the national university championship. The team, coached by Mr. Sipho Dlamini, has been on an incredible run this season, winning all 12 of their league matches. The trophy will be on display in the sports centre lobby.', 'Sports', 'Sports & Recreation', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800'),
('Mental Health Awareness Week Kicks Off', 'Join us for a week of events focused on student mental health and wellness.', 'Mental Health Awareness Week begins on Monday with a series of free workshops, counselling sessions, and community events. The theme this year is "You Are Not Alone." Events include mindfulness sessions, art therapy workshops, and panel discussions with mental health professionals. All students are encouraged to participate. Confidential counselling services are available at the Student Wellness Centre.', 'Wellness', 'Student Affairs', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800')
ON CONFLICT DO NOTHING;

-- Sample campus events
INSERT INTO public.campus_events (title, description, full_description, event_date, end_date, location, category, organizer, capacity, image_url, featured) VALUES
('Career Fair 2026', 'Meet top employers and explore career opportunities', 'Join us for the biggest Career Fair of the year! Over 100 leading companies will be present. Network with recruiters, submit your CV, and learn about internship programs.', '2026-03-15 09:00:00+02', '2026-03-15 17:00:00+02', 'Main Campus Auditorium', 'Career', 'Career Services Office', 500, 'https://images.unsplash.com/photo-1559223607-a43c990c324c?w=800', true),
('Spring Sports Festival', 'Inter-faculty sports competition and fun activities', 'The annual Spring Sports Festival is back! Compete in soccer, basketball, volleyball, and more. Prizes for winning teams, plus food trucks and live music.', '2026-04-01 08:00:00+02', '2026-04-01 18:00:00+02', 'Sports Complex', 'Sports', 'Sports & Recreation', 300, 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800', false),
('Tech Innovation Summit', 'Student startup showcase and tech industry insights', 'The Tech Innovation Summit brings together student entrepreneurs and industry leaders. Witness startup presentations and attend workshops on product development. Pitch competition with R50,000 in prizes.', '2026-03-08 10:00:00+02', '2026-03-08 16:00:00+02', 'Innovation Hub', 'Technology', 'Entrepreneurship Center', 200, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', true),
('Cultural Festival: Heritage Celebration', 'Celebrating South African diversity through music, food, and art', 'Experience the rich cultural diversity of South Africa at our annual Cultural Festival. Enjoy traditional music, authentic cuisine, art exhibitions, and cultural fashion shows.', '2026-04-28 11:00:00+02', '2026-04-28 19:00:00+02', 'Central Quad', 'Cultural', 'Student Societies Council', 1000, 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', false),
('Guest Lecture: AI and the Future of Work', 'Renowned AI researcher discusses career opportunities in artificial intelligence', 'Dr. Michael Chen, Chief AI Scientist, will discuss the latest developments in AI and career paths in the field. Q&A session follows. Free admission but registration required.', '2026-03-10 18:00:00+02', '2026-03-10 20:00:00+02', 'Science Lecture Hall A', 'Academic', 'Computer Science Department', 150, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800', false),
('Volunteer Day: Community Outreach', 'Join us in giving back to the local community', 'Volunteer Day involves service projects including teaching at local schools, environmental cleanup, and food drives. Transportation provided. Lunch and refreshments included.', '2026-03-05 07:00:00+02', '2026-03-05 15:00:00+02', 'Various Community Locations', 'Community', 'Student Volunteer Corps', 100, 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800', false)
ON CONFLICT DO NOTHING;
