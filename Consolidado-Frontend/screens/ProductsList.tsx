import React, { useState, useEffect, useMemo } from 'react';
import { Screen } from '../types';
// Importamos el tipo real que definimos en AbastecimientoTypes
import { ProductoCatalogo } from '../interfaces/AbastecimientoTypes';
// Importamos el servicio
import { abastecimientoService } from '../services/AbastecimientoService';
import { PlusIcon, SearchIcon, ViewIcon, EditIcon, InventoryIcon, BackIcon } from '../components/icons/IconsAbastecimiento';

interface ProductsListProps {
  onNavigate: (screen: Screen) => void;
  // Ya no recibimos 'products' por props, se carga internamente
  onViewProduct: (product: ProductoCatalogo) => void;
  onRegister: () => void;
  onEditProduct: (product: ProductoCatalogo) => void;
}

const ProductsList: React.FC<ProductsListProps> = ({ onNavigate, onViewProduct, onRegister, onEditProduct }) => {
  
  // 1. ESTADOS
  const [products, setProducts] = useState<ProductoCatalogo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 2. CARGAR DATOS DEL BACKEND
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
        setLoading(true);
        const data = await abastecimientoService.listarCatalogoProductos();
        setProducts(data);
        setError(null);
    } catch (err) {
        console.error("Error al cargar productos:", err);
        setError("No se pudo cargar el catálogo de productos. Verifique la conexión.");
    } finally {
        setLoading(false);
    }
  };

  // 3. FILTRADO LOCAL (Buscador)
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    
    const term = searchTerm.toLowerCase();
    return products.filter(p =>
      p.nombre_producto.toLowerCase().includes(term) ||
      p.rubro.toLowerCase().includes(term) ||
      p.familia.toLowerCase().includes(term) ||
      p.clase.toLowerCase().includes(term) ||
      (p.marca || '').toLowerCase().includes(term) ||
      p.cod_producto.toString().includes(term)
    );
  }, [products, searchTerm]);

  // 4. RENDERIZADO
  if (loading && products.length === 0) {
      return <div className="p-10 text-center text-sky-700 animate-pulse">Cargando catálogo de productos...</div>;
  }

  if (error) {
      return (
        <div className="p-10 text-center text-red-600">
            {error}<br/>
            <button onClick={cargarProductos} className="underline mt-2 font-bold">Reintentar</button>
        </div>
      );
  }

  return (
    <div className="p-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
            <button onClick={() => onNavigate(Screen.MainMenu)} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Volver al menú principal">
                <BackIcon className="h-6 w-6 text-gray-600"/>
            </button>
            <div className="flex items-center">
                <div className="w-16 h-16 mr-4 p-2 bg-sky-100 rounded-lg flex items-center justify-center">
                  <InventoryIcon className="w-12 h-12 text-sky-700"/>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Productos</h1>
            </div>
        </div>
        <div className="flex items-center space-x-4">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Buscar por nombre, marca, rubro..." 
                    className="border-2 border-gray-300 rounded-lg p-2 pl-4 pr-10 focus:outline-none focus:border-sky-500 w-80" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
            </div>
            <button 
              onClick={onRegister}
              className="flex items-center bg-sky-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200"
            >
              Registrar Producto
              <div className="ml-2 bg-white rounded-full p-1">
                <PlusIcon className="h-5 w-5 text-sky-600"/>
              </div>
            </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-300">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-sky-700 text-white">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold">CODIGO</th>
              <th className="text-left py-3 px-4 uppercase font-semibold">NOMBRE</th>
              <th className="text-left py-3 px-4 uppercase font-semibold">RUBRO</th>
              <th className="text-left py-3 px-4 uppercase font-semibold">FAMILIA</th>
              <th className="text-left py-3 px-4 uppercase font-semibold">CLASE</th>
              <th className="text-left py-3 px-4 uppercase font-semibold">MARCA</th>
              <th className="text-left py-3 px-4 uppercase font-semibold">UNIDAD</th>
              <th className="text-right py-3 px-4 uppercase font-semibold">PRECIO BASE</th>
              <th className="py-3 px-4 uppercase font-semibold text-center">VER</th>
              <th className="py-3 px-4 uppercase font-semibold text-center">EDITAR</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredProducts.map((product) => (
              <tr key={product.cod_producto} className="border-b border-gray-200 hover:bg-sky-50 transition-colors">
                
                {/* Código con ceros a la izquierda para mejor visualización */}
                <td className="text-left py-3 px-4 font-mono text-gray-500">
                    {product.cod_producto}
                </td>
                
                <td className="text-left py-3 px-4 font-medium text-gray-900">{product.nombre_producto}</td>
                <td className="text-left py-3 px-4">{product.rubro}</td>
                <td className="text-left py-3 px-4">{product.familia}</td>
                <td className="text-left py-3 px-4">{product.clase}</td>
                <td className="text-left py-3 px-4">{product.marca || '-'}</td>
                <td className="text-left py-3 px-4">{product.unidad_medida}</td>
                
                <td className="text-right py-3 px-4 font-bold text-gray-700">
                    S/. {product.precio_base ? product.precio_base.toFixed(2) : '0.00'}
                </td>
                
                <td className="text-center py-3 px-4">
                    <button onClick={() => onViewProduct(product)} className="text-sky-600 hover:text-sky-800" aria-label={`Ver ${product.nombre_producto}`}>
                        <ViewIcon className="w-5 h-5"/>
                    </button>
                </td>
                 <td className="text-center py-3 px-4">
                    <button onClick={() => onEditProduct(product)} className="text-gray-500 hover:text-gray-700" aria-label={`Editar ${product.nombre_producto}`}>
                        <EditIcon className="w-5 h-5"/>
                    </button>
                </td>
              </tr>
            ))}
            
            {filteredProducts.length === 0 && (
                <tr>
                    <td colSpan={10} className="p-8 text-center text-gray-500 italic">
                        No se encontraron productos en el catálogo.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsList;