import React, { useState, useEffect } from 'react';
import { supabase, uploadPropertyImage } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Loader2, Save, Image as ImageIcon, Video } from 'lucide-react';
import { getCountries, getProvinces, getCities } from '../../data/locationData';
import LocationPicker from '../../components/map/LocationPicker';

const PropertyForm = () => {
    const { id } = useParams();
    const isEditing = Boolean(id);
    const navigate = useNavigate();
    const { profile } = useAuth();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        currency: 'USD',
        location: '',
        country: 'Argentina',
        province: '',
        city: '',
        address: '',
        type: 'sale',
        property_type: 'house',
        status: 'published',
        bedrooms: 0,
        bathrooms: 0,
        area_m2: '',
        images: [],
        video_url: '',
        latitude: null,
        longitude: null,
    });

    // Extract YouTube video ID from various URL formats
    const getYouTubeId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
        return match ? match[1] : null;
    };

    useEffect(() => {
        if (isEditing) {
            fetchProperty();
        }
    }, [id]);

    const fetchProperty = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            alert('Propiedad no encontrada');
            navigate('/admin/propiedades');
            return;
        }

        setForm({
            title: data.title || '',
            description: data.description || '',
            price: data.price || '',
            currency: data.currency || 'USD',
            location: data.location || '',
            country: data.country || 'Argentina',
            province: data.province || '',
            city: data.city || '',
            address: data.address || '',
            type: data.type || 'sale',
            property_type: data.property_type || 'house',
            status: data.status || 'draft',
            bedrooms: data.bedrooms || 0,
            bathrooms: data.bathrooms || 0,
            area_m2: data.area_m2 || '',
            images: data.images || [],
            video_url: data.video_url || '',
            latitude: data.latitude || null,
            longitude: data.longitude || null,
        });
        setLoading(false);
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImagePreviews(prev => [...prev, ev.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeNewImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setForm(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Upload new images as WebP
            let uploadedUrls = [];
            if (imageFiles.length > 0) {
                setUploading(true);
                const propertyId = id || crypto.randomUUID();

                for (const file of imageFiles) {
                    const url = await uploadPropertyImage(file, profile.id, propertyId);
                    uploadedUrls.push(url);
                }
                setUploading(false);
            }

            const allImages = [...form.images, ...uploadedUrls];

            const propertyData = {
                title: form.title,
                description: form.description,
                price: Number(form.price),
                currency: form.currency,
                location: form.location,
                country: form.country,
                province: form.province,
                city: form.city,
                address: form.address,
                type: form.type,
                property_type: form.property_type,
                status: form.status,
                bedrooms: Number(form.bedrooms),
                bathrooms: Number(form.bathrooms),
                area_m2: form.area_m2 ? Number(form.area_m2) : null,
                images: allImages,
                video_url: form.video_url || null,
                latitude: form.latitude || null,
                longitude: form.longitude || null,
                updated_at: new Date().toISOString(),
            };

            if (isEditing) {
                const { error } = await supabase
                    .from('properties')
                    .update(propertyData)
                    .eq('id', id);

                if (error) throw error;
            } else {
                propertyData.agent_id = profile.id;
                const { error } = await supabase
                    .from('properties')
                    .insert(propertyData);

                if (error) throw error;
            }

            navigate('/admin/propiedades');
        } catch (err) {
            console.error('Error saving property:', err);
            alert('Error al guardar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-primary-400" />
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={() => navigate('/admin/propiedades')}
                className="flex items-center gap-2 text-primary-400 hover:text-primary-950 transition-colors mb-8 text-xs font-bold uppercase tracking-widest"
            >
                <ArrowLeft size={16} /> Volver a propiedades
            </button>

            <h1 className="text-3xl font-display font-light text-primary-950 uppercase tracking-tight mb-8">
                {isEditing ? 'Editar' : 'Nueva'} <span className="font-bold">Propiedad</span>
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
                {/* Basic Info */}
                <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-8 space-y-6">
                    <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-400 mb-4">Información General</h2>

                    <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">Título *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                            placeholder="Ej: Casa moderna con piscina"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">Descripción</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors resize-none"
                            placeholder="Describe la propiedad..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">Precio *</label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={(e) => handleChange('price', e.target.value)}
                                required
                                min="0"
                                className="w-full px-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                                placeholder="150000"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">Moneda</label>
                            <select
                                value={form.currency}
                                onChange={(e) => handleChange('currency', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors bg-white"
                            >
                                <option value="USD">USD</option>
                                <option value="ARS">ARS</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">Operación</label>
                            <select
                                value={form.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors bg-white"
                            >
                                <option value="sale">Venta</option>
                                <option value="rent">Alquiler</option>
                                <option value="investment">Inversión</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">Tipo de Propiedad</label>
                            <select
                                value={form.property_type}
                                onChange={(e) => handleChange('property_type', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors bg-white"
                            >
                                <option value="house">Casa</option>
                                <option value="apartment">Departamento</option>
                                <option value="land">Terreno</option>
                                <option value="office">Oficina</option>
                                <option value="commercial">Comercial</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">Estado</label>
                            <select
                                value={form.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors bg-white"
                            >
                                <option value="draft">Borrador</option>
                                <option value="published">Publicada</option>
                                <option value="sold">Vendida</option>
                                <option value="rented">Alquilada</option>
                                <option value="archived">Archivada</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Characteristics */}
                <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-8 space-y-6">
                    <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-400 mb-4">Características</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">Dormitorios</label>
                            <input
                                type="number"
                                value={form.bedrooms}
                                onChange={(e) => handleChange('bedrooms', e.target.value)}
                                min="0"
                                className="w-full px-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">Baños</label>
                            <input
                                type="number"
                                value={form.bathrooms}
                                onChange={(e) => handleChange('bathrooms', e.target.value)}
                                min="0"
                                className="w-full px-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">Superficie (m²)</label>
                            <input
                                type="number"
                                value={form.area_m2}
                                onChange={(e) => handleChange('area_m2', e.target.value)}
                                min="0"
                                className="w-full px-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-8 space-y-6">
                    <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-400 mb-4">Ubicación</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">País</label>
                            <select
                                value={form.country}
                                onChange={(e) => {
                                    const newCountry = e.target.value;
                                    setForm(prev => ({ ...prev, country: newCountry, province: '', city: '' }));
                                }}
                                className="w-full px-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors bg-white"
                            >
                                <option value="">Seleccionar país</option>
                                {getCountries().map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">Provincia / Estado</label>
                            <select
                                value={form.province}
                                onChange={(e) => {
                                    const newProvince = e.target.value;
                                    setForm(prev => ({ ...prev, province: newProvince, city: '' }));
                                }}
                                disabled={!form.country}
                                className="w-full px-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Seleccionar provincia</option>
                                {getProvinces(form.country).map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">Ciudad</label>
                            <select
                                value={form.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                                disabled={!form.province}
                                className="w-full px-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Seleccionar ciudad</option>
                                {getCities(form.country, form.province).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">Ubicación (texto visible) *</label>
                        <input
                            type="text"
                            value={form.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                            placeholder="Ej: Centro, Posadas"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">Dirección</label>
                        <input
                            type="text"
                            value={form.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                            placeholder="Ej: Av. Corrientes 1234"
                        />
                    </div>

                    {/* Map Location Picker */}
                    <div className="mt-6 pt-6 border-t border-gray-50">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-4">Ubicación en Mapa</label>
                        <LocationPicker
                            latitude={form.latitude}
                            longitude={form.longitude}
                            onChange={({ latitude, longitude }) => {
                                setForm(prev => ({ ...prev, latitude, longitude }));
                            }}
                        />
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-8 space-y-6">
                    <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-400 mb-4">Imágenes</h2>

                    {/* Existing images */}
                    {form.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {form.images.map((url, i) => (
                                <div key={i} className="relative group aspect-video bg-gray-100 rounded-sm overflow-hidden">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(i)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* New image previews */}
                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {imagePreviews.map((src, i) => (
                                <div key={`new-${i}`} className="relative group aspect-video bg-gray-100 rounded-sm overflow-hidden ring-2 ring-gold-400">
                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-gold-500 text-white text-[8px] font-bold uppercase rounded-sm">Nueva</div>
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(i)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload button */}
                    <label className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-sm cursor-pointer hover:border-primary-300 transition-colors">
                        <ImageIcon size={32} className="text-primary-300 mb-3" />
                        <span className="text-xs font-bold uppercase tracking-widest text-primary-400">
                            Click para subir imágenes
                        </span>
                        <span className="text-[10px] text-primary-300 mt-1">
                            Se convierten automáticamente a WebP
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* Video YouTube */}
                <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-8 space-y-6">
                    <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-400 mb-4">Video de YouTube</h2>

                    <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-primary-950 block mb-2">Link del video</label>
                        <div className="relative">
                            <Video size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-300" />
                            <input
                                type="url"
                                value={form.video_url}
                                onChange={(e) => handleChange('video_url', e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border border-gray-100 rounded-sm text-sm focus:outline-none focus:border-primary-300 transition-colors"
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                        </div>
                        <p className="text-[10px] text-primary-300 mt-2">
                            Pegá el link de YouTube. El video se reproduce desde YouTube, no ocupa espacio en la base de datos.
                        </p>
                    </div>

                    {/* Video Preview */}
                    {getYouTubeId(form.video_url) && !saving && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-primary-950">Preview</span>
                                <button
                                    type="button"
                                    onClick={() => handleChange('video_url', '')}
                                    className="text-[10px] uppercase font-bold tracking-widest text-red-400 hover:text-red-600 transition-colors"
                                >
                                    Quitar video
                                </button>
                            </div>
                            <div className="aspect-video rounded-sm overflow-hidden border border-gray-100">
                                <iframe
                                    src={`https://www.youtube.com/embed/${getYouTubeId(form.video_url)}`}
                                    title="Video preview"
                                    className="w-full h-full"
                                    loading="lazy"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-primary-950 text-white px-12 py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 hover:bg-primary-800 transition-all disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                {uploading ? 'Subiendo imágenes...' : 'Guardando...'}
                            </>
                        ) : (
                            <>
                                <Save size={14} /> {isEditing ? 'Guardar Cambios' : 'Crear Propiedad'}
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/propiedades')}
                        className="px-8 py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-[10px] text-primary-400 hover:text-primary-950 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PropertyForm;
