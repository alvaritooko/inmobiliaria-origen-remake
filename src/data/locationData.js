/**
 * Hierarchical location data for Argentina, Paraguay, and Brazil.
 * Country → Province/State → Cities
 */

const LOCATION_DATA = {
    Argentina: {
        'Buenos Aires': [
            'Capital Federal', 'La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil',
            'Quilmes', 'Lanús', 'Avellaneda', 'Lomas de Zamora', 'San Isidro',
            'Tigre', 'Vicente López', 'Morón', 'Merlo', 'San Martín',
            'Pilar', 'Escobar', 'Zárate', 'Campana', 'Luján',
            'Junín', 'Pergamino', 'San Nicolás', 'Necochea', 'Olavarría',
        ],
        'Misiones': [
            'Posadas', 'Oberá', 'Eldorado', 'Puerto Iguazú', 'Jardín América',
            'Leandro N. Alem', 'Apóstoles', 'San Vicente', 'Puerto Rico',
            'Montecarlo', 'Aristóbulo del Valle', 'San Pedro', 'Garupá',
            'Candelaria', 'Wanda', 'Comandante Andresito', 'Puerto Esperanza',
            'Dos de Mayo', 'Campo Grande', 'Bernardo de Irigoyen',
        ],
        'Córdoba': [
            'Córdoba', 'Villa María', 'Río Cuarto', 'San Francisco', 'Villa Carlos Paz',
            'Jesús María', 'Alta Gracia', 'Bell Ville', 'La Falda', 'Cosquín',
        ],
        'Santa Fe': [
            'Santa Fe', 'Rosario', 'Rafaela', 'Reconquista', 'Venado Tuerto',
            'Villa Gobernador Gálvez', 'Casilda', 'Esperanza', 'San Lorenzo',
        ],
        'Mendoza': [
            'Mendoza', 'San Rafael', 'Godoy Cruz', 'Guaymallén', 'Las Heras',
            'Luján de Cuyo', 'Maipú', 'Tunuyán', 'San Martín',
        ],
        'Tucumán': [
            'San Miguel de Tucumán', 'Yerba Buena', 'Tafí Viejo', 'Banda del Río Salí',
            'Concepción', 'Aguilares', 'Monteros', 'Famaillá',
        ],
        'Entre Ríos': [
            'Paraná', 'Concordia', 'Gualeguaychú', 'Concepción del Uruguay',
            'Colón', 'Villaguay', 'Chajarí', 'Victoria', 'Federación',
        ],
        'Salta': [
            'Salta', 'San Ramón de la Nueva Orán', 'Tartagal', 'General Güemes',
            'Metán', 'Cafayate', 'Rosario de la Frontera',
        ],
        'Chaco': [
            'Resistencia', 'Presidencia Roque Sáenz Peña', 'Barranqueras',
            'Villa Ángela', 'General San Martín', 'Charata',
        ],
        'Corrientes': [
            'Corrientes', 'Goya', 'Paso de los Libres', 'Mercedes',
            'Curuzú Cuatiá', 'Santo Tomé', 'Ituzaingó', 'Bella Vista',
        ],
        'Santiago del Estero': [
            'Santiago del Estero', 'La Banda', 'Termas de Río Hondo',
            'Añatuya', 'Frías',
        ],
        'San Juan': [
            'San Juan', 'Rawson', 'Rivadavia', 'Chimbas', 'Pocito', 'Caucete',
        ],
        'Jujuy': [
            'San Salvador de Jujuy', 'Palpalá', 'San Pedro de Jujuy',
            'Libertador General San Martín', 'Humahuaca', 'Tilcara',
        ],
        'Río Negro': [
            'Viedma', 'San Carlos de Bariloche', 'General Roca', 'Cipolletti',
            'Allen', 'El Bolsón', 'Choele Choel',
        ],
        'Neuquén': [
            'Neuquén', 'Centenario', 'Plottier', 'Cutral-Có', 'Zapala',
            'San Martín de los Andes', 'Villa La Angostura', 'Junín de los Andes',
        ],
        'Formosa': [
            'Formosa', 'Clorinda', 'Pirané', 'El Colorado',
        ],
        'Chubut': [
            'Rawson', 'Comodoro Rivadavia', 'Trelew', 'Puerto Madryn', 'Esquel',
        ],
        'San Luis': [
            'San Luis', 'Villa Mercedes', 'Merlo', 'Juana Koslay',
        ],
        'Catamarca': [
            'San Fernando del Valle de Catamarca', 'Valle Viejo', 'Fray Mamerto Esquiú',
        ],
        'La Rioja': [
            'La Rioja', 'Chilecito', 'Aimogasta',
        ],
        'La Pampa': [
            'Santa Rosa', 'General Pico', 'Toay',
        ],
        'Santa Cruz': [
            'Río Gallegos', 'Caleta Olivia', 'El Calafate', 'Puerto Deseado',
        ],
        'Tierra del Fuego': [
            'Ushuaia', 'Río Grande', 'Tolhuin',
        ],
    },
    Paraguay: {
        'Central': [
            'Asunción', 'San Lorenzo', 'Luque', 'Lambaré', 'Fernando de la Mora',
            'Capiatá', 'Limpio', 'Ñemby', 'Mariano Roque Alonso', 'Villa Elisa',
            'San Antonio', 'Itauguá', 'Areguá',
        ],
        'Alto Paraná': [
            'Ciudad del Este', 'Presidente Franco', 'Hernandarias', 'Minga Guazú',
            'Santa Rita', 'San Alberto',
        ],
        'Itapúa': [
            'Encarnación', 'Hohenau', 'Obligado', 'Bella Vista', 'Cambyretá',
            'Capitán Miranda', 'Trinidad',
        ],
        'Caaguazú': [
            'Coronel Oviedo', 'Caaguazú', 'Juan Manuel Frutos',
        ],
        'San Pedro': [
            'San Pedro de Ycuamandiyú', 'Santa Rosa del Aguaray',
        ],
        'Guairá': [
            'Villarrica', 'Iturbe',
        ],
        'Paraguarí': [
            'Paraguarí', 'Yaguarón', 'Piribebuy',
        ],
        'Concepción': [
            'Concepción', 'Horqueta',
        ],
        'Amambay': [
            'Pedro Juan Caballero', 'Capitán Bado',
        ],
        'Canindeyú': [
            'Salto del Guairá', 'Curuguaty',
        ],
        'Cordillera': [
            'Caacupé', 'Tobatí', 'Altos', 'Atyrá',
        ],
        'Misiones': [
            'San Juan Bautista', 'Ayolas', 'San Ignacio',
        ],
        'Ñeembucú': [
            'Pilar',
        ],
        'Presidente Hayes': [
            'Villa Hayes', 'Benjamín Aceval',
        ],
    },
    Brasil: {
        'São Paulo': [
            'São Paulo', 'Campinas', 'Santos', 'Guarulhos', 'São Bernardo do Campo',
            'Ribeirão Preto', 'Sorocaba', 'São José dos Campos',
        ],
        'Rio de Janeiro': [
            'Rio de Janeiro', 'Niterói', 'Petrópolis', 'Nova Iguaçu', 'Duque de Caxias',
        ],
        'Minas Gerais': [
            'Belo Horizonte', 'Uberlândia', 'Juiz de Fora', 'Contagem', 'Ouro Preto',
        ],
        'Paraná': [
            'Curitiba', 'Londrina', 'Maringá', 'Foz do Iguaçu', 'Ponta Grossa',
            'Cascavel', 'Guarapuava',
        ],
        'Rio Grande do Sul': [
            'Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Novo Hamburgo',
            'Santa Maria', 'Gramado',
        ],
        'Santa Catarina': [
            'Florianópolis', 'Joinville', 'Blumenau', 'Balneário Camboriú',
            'Chapecó', 'Criciúma',
        ],
        'Bahia': [
            'Salvador', 'Feira de Santana', 'Camaçari', 'Ilhéus', 'Porto Seguro',
        ],
        'Pernambuco': [
            'Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru',
        ],
        'Ceará': [
            'Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Sobral',
        ],
        'Goiás': [
            'Goiânia', 'Aparecida de Goiânia', 'Anápolis',
        ],
        'Distrito Federal': [
            'Brasília',
        ],
        'Mato Grosso do Sul': [
            'Campo Grande', 'Dourados', 'Ponta Porã',
        ],
        'Mato Grosso': [
            'Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop',
        ],
    },
};

/**
 * Get list of countries.
 */
export const getCountries = () => Object.keys(LOCATION_DATA);

/**
 * Get provinces/states for a given country.
 */
export const getProvinces = (country) => {
    if (!country || !LOCATION_DATA[country]) return [];
    return Object.keys(LOCATION_DATA[country]).sort();
};

/**
 * Get cities for a given country + province.
 */
export const getCities = (country, province) => {
    if (!country || !province || !LOCATION_DATA[country]?.[province]) return [];
    return [...LOCATION_DATA[country][province]].sort();
};

export default LOCATION_DATA;
