-- ============================================================
-- ORIGEN INMOBILIARIA — Supabase Database Schema
-- Ejecutar en: Supabase → SQL Editor → New Query
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABLA PROFILES (usuarios con roles)
-- ============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'agent', 'user')),
  avatar_url TEXT,
  phone TEXT,
  city TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver perfiles
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- Usuarios editan su propio perfil
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin puede editar cualquier perfil
CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Solo admin inserta perfiles (crear agentes)
CREATE POLICY "profiles_insert_admin"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Solo admin borra perfiles
CREATE POLICY "profiles_delete_admin"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 2. TABLA PROPERTIES (publicaciones de propiedades)
-- ============================================================
CREATE TABLE properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'ARS')),
  location TEXT NOT NULL,
  country TEXT DEFAULT 'Argentina',
  province TEXT,
  city TEXT,
  address TEXT,
  images TEXT[] DEFAULT '{}',
  type TEXT CHECK (type IN ('sale', 'rent', 'investment')) DEFAULT 'sale',
  property_type TEXT CHECK (property_type IN ('house', 'apartment', 'land', 'office', 'commercial', 'other')) DEFAULT 'house',
  status TEXT CHECK (status IN ('published', 'draft', 'sold', 'rented', 'archived')) DEFAULT 'draft',
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  area_m2 NUMERIC,
  video_url TEXT,
  features JSONB DEFAULT '{}'::jsonb,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Público ve publicadas; agente ve las suyas; admin ve todas
CREATE POLICY "properties_select"
  ON properties FOR SELECT
  USING (
    status = 'published'
    OR agent_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin y agentes pueden crear publicaciones
CREATE POLICY "properties_insert"
  ON properties FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'agent')
    )
  );

-- Agente edita las suyas, admin edita todas
CREATE POLICY "properties_update"
  ON properties FOR UPDATE
  USING (
    agent_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Agente borra las suyas, admin borra todas
CREATE POLICY "properties_delete"
  ON properties FOR DELETE
  USING (
    agent_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 3. TRIGGER: crear perfil automáticamente al registrar usuario
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. STORAGE POLICIES (bucket: property-images)
-- Crear primero el bucket en Supabase → Storage → New Bucket
-- Nombre: property-images | Público: sí
-- ============================================================

-- Cualquiera ve imágenes
CREATE POLICY "property_images_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

-- Admin y agentes suben imágenes
CREATE POLICY "property_images_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'agent')
    )
  );

-- Borrar: agente sus carpetas, admin todas
CREATE POLICY "property_images_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-images'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Actualizar: agente sus carpetas, admin todas
CREATE POLICY "property_images_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'property-images'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );
