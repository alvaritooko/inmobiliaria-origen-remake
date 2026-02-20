import React from 'react';
import { Bed, Bath, Maximize, MapPin, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property }) => {
    return (
        <Link to={`/propiedad/${property.id}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
            >
                <div className="relative overflow-hidden mb-5">
                    <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-[400px] object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-white px-4 py-1.5 text-[10px] uppercase font-bold tracking-[0.2em] text-primary-950 shadow-sm">
                        En Venta
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-display font-light text-primary-950 group-hover:text-gold-600 transition-colors uppercase tracking-tight">
                                {property.title}
                            </h3>
                            <div className="flex items-center gap-1 text-primary-300 mt-1">
                                <MapPin size={12} className="text-gold-500" />
                                <span className="text-[10px] uppercase tracking-widest font-bold">{property.location}</span>
                            </div>
                        </div>
                        <div className="p-3 border border-primary-100 rounded-full group-hover:bg-primary-950 group-hover:text-white transition-all duration-300">
                            <ArrowUpRight size={18} />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 py-5 border-y border-gray-50">
                        <div className="flex items-center gap-2 text-primary-400">
                            <Bed size={14} />
                            <span className="text-xs font-medium uppercase tracking-tighter">{property.beds} Dorm</span>
                        </div>
                        <div className="flex items-center gap-2 text-primary-400">
                            <Bath size={14} />
                            <span className="text-xs font-medium uppercase tracking-tighter">{property.baths} Baños</span>
                        </div>
                        <div className="flex items-center gap-2 text-primary-400">
                            <Maximize size={14} />
                            <span className="text-xs font-medium uppercase tracking-tighter">{property.area}</span>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center">
                        <span className="text-2xl font-display font-light text-primary-950 tracking-tighter">
                            USD {property.price.toLocaleString()}
                        </span>
                        <span className="text-[9px] uppercase tracking-[0.3em] text-gold-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            Detalles →
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export default PropertyCard;
