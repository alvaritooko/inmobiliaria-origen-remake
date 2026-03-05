import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize, ArrowUpRight } from 'lucide-react';

const typeLabels = { sale: 'Venta', rent: 'Alquiler', investment: 'Inversión' };

const PropertyMapPopup = ({ property }) => {
    const image = property.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&auto=format&fit=crop';
    const location = property.city
        ? `${property.city}, ${property.province || ''}`
        : property.location || '';
    const beds = property.bedrooms || 0;
    const baths = property.bathrooms || 0;
    const area = property.area_m2 ? `${property.area_m2}m²` : '—';

    return (
        <div className="w-[260px] font-sans">
            {/* Image */}
            <div className="relative h-[140px] -mx-5 -mt-3 mb-3 overflow-hidden">
                <img
                    src={image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-white px-2 py-0.5 text-[8px] uppercase font-bold tracking-[0.15em] text-primary-950 shadow-sm">
                    {typeLabels[property.type] || 'Venta'}
                </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
                <h4 className="text-sm font-bold text-primary-950 uppercase tracking-tight leading-tight line-clamp-1">
                    {property.title}
                </h4>
                <p className="text-[9px] uppercase tracking-widest text-primary-400 font-bold">
                    {location}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-3 py-2 border-y border-gray-100">
                    <div className="flex items-center gap-1 text-primary-400">
                        <Bed size={11} />
                        <span className="text-[9px] font-bold">{beds}</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary-400">
                        <Bath size={11} />
                        <span className="text-[9px] font-bold">{baths}</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary-400">
                        <Maximize size={11} />
                        <span className="text-[9px] font-bold">{area}</span>
                    </div>
                </div>

                {/* Price + Link */}
                <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-primary-950 tracking-tight">
                        {property.currency || 'USD'} {property.price?.toLocaleString()}
                    </span>
                    <Link
                        to={`/propiedad/${property.id}`}
                        className="flex items-center gap-1 text-[8px] uppercase font-bold tracking-[0.15em] text-gold-600 hover:text-gold-700 transition-colors"
                    >
                        Ver <ArrowUpRight size={10} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PropertyMapPopup;
