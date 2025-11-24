import {
    Proveedor,
    ProductoCatalogo,
    PedidoAbastecimiento,
    PedidoDetalle,
    SolicitudCotizacion,
    ItemPendienteCotizacion,
    GenerarSolicitudRequest,
    ProveedorBusqueda,
    ProductoParaCotizar,
    RegistrarCotizacionRequest,
    DetalleOferta,
    GenerarOrdenCompraRequest,
    OrdenPendienteRecepcion,
    ProductoProgramable,
    ProgramarRecepcionRequest
} from '../interfaces/AbastecimientoTypes';

// URL base mapeada al @RequestMapping("/api/abastecimiento") de tu Controller
const API_URL = "http://localhost:8080/api/abastecimiento";

export const abastecimientoService = {


    // GET /api/abastecimiento/proveedores
    listarTodosProveedores: async (): Promise<Proveedor[]> => {
        const response = await fetch(`${API_URL}/proveedores`);
        
        if (!response.ok) {
            throw new Error("Error al obtener la lista de proveedores");
        }
        
        // Manejo de respuesta vacía (204 No Content)
        if (response.status === 204) {
            return [];
        }
        
        return response.json();
    },

    // GET /api/abastecimiento/productos
    listarCatalogoProductos: async (): Promise<ProductoCatalogo[]> => {
        const response = await fetch(`${API_URL}/productos`);
        
        if (!response.ok) {
            throw new Error("Error al obtener el catálogo de productos");
        }
        
        // Manejo de respuesta vacía (204 No Content)
        if (response.status === 204) {
            return [];
        }
        
        return response.json();
    },

    // ==========================================
    // 1. GESTIÓN DE PEDIDOS
    // ==========================================

    // GET /api/abastecimiento/pedidos
    getPedidosResumen: async (): Promise<PedidoAbastecimiento[]> => {
        const response = await fetch(`${API_URL}/pedidos`);
        if (!response.ok) throw new Error("Error al obtener la lista de pedidos");
        
        // Si el backend devuelve 204 (No Content), retornamos array vacío para evitar error de JSON
        if (response.status === 204) return [];
        
        return response.json();
    },

    // GET /api/abastecimiento/pedidos/{id}/detalle
    getPedidoDetalle: async (id: number): Promise<PedidoDetalle> => {
        const response = await fetch(`${API_URL}/pedidos/${id}/detalle`);
        if (!response.ok) throw new Error("Error al obtener el detalle del pedido");
        return response.json();
    },

    // PUT /api/abastecimiento/pedidos/{id}/revisar
    marcarPedidoRevisado: async (id: number): Promise<string> => {
        const response = await fetch(`${API_URL}/pedidos/${id}/revisar`, {
            method: 'PUT'
        });
        
        if (!response.ok) throw new Error("Error al marcar pedido como revisado");
        return response.text(); // El backend devuelve un String, no un JSON
    },

    // ==========================================
    // 2. GESTIÓN DE SOLICITUDES DE COTIZACIÓN
    // ==========================================

    // GET /api/abastecimiento/solicitudes
    getSolicitudesResumen: async (): Promise<SolicitudCotizacion[]> => {
        const response = await fetch(`${API_URL}/solicitudes`);
        if (!response.ok) throw new Error("Error al obtener solicitudes");
        if (response.status === 204) return [];
        return response.json();
    },

    // GET /api/abastecimiento/solicitudes/items-pendientes?desde=...&hasta=...
    getItemsPendientes: async (desde?: string, hasta?: string): Promise<ItemPendienteCotizacion[]> => {
        const params = new URLSearchParams();
        if (desde) params.append('desde', desde);
        if (hasta) params.append('hasta', hasta);
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_URL}/solicitudes/items-pendientes${queryString}`);
        
        if (!response.ok) throw new Error("Error al obtener items pendientes");
        return response.json();
    },

    // POST /api/abastecimiento/solicitudes/generar
    generarSolicitud: async (data: GenerarSolicitudRequest): Promise<string> => {
        const response = await fetch(`${API_URL}/solicitudes/generar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Error al generar solicitud");
        }
        return response.text();
    },

    // GET /api/abastecimiento/solicitudes/{id}/productos-para-cotizar
    getProductosParaCotizar: async (idSolicitud: number): Promise<ProductoParaCotizar[]> => {
        const response = await fetch(`${API_URL}/solicitudes/${idSolicitud}/productos-para-cotizar`);
        if (!response.ok) throw new Error("Error al obtener productos para cotizar");
        return response.json();
    },

    // ==========================================
    // 3. REGISTRO DE COTIZACIONES (PROVEEDORES)
    // ==========================================

    // GET /api/abastecimiento/proveedores/buscar?termino=...
    buscarProveedores: async (termino: string): Promise<ProveedorBusqueda[]> => {
        const response = await fetch(`${API_URL}/proveedores/buscar?termino=${encodeURIComponent(termino)}`);
        if (!response.ok) throw new Error("Error al buscar proveedores");
        return response.json();
    },

    // POST /api/abastecimiento/cotizaciones
    registrarCotizacion: async (data: RegistrarCotizacionRequest): Promise<string> => {
        const response = await fetch(`${API_URL}/cotizaciones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Error al registrar cotización");
        }
        return response.text();
    },

    // ==========================================
    // 4. ADJUDICACIÓN Y ÓRDENES DE COMPRA
    // ==========================================

    // GET /api/abastecimiento/solicitudes/{id}/proveedores-cotizantes
    getProveedoresCotizantes: async (idSolicitud: number): Promise<ProveedorBusqueda[]> => {
        const response = await fetch(`${API_URL}/solicitudes/${idSolicitud}/proveedores-cotizantes`);
        if (!response.ok) throw new Error("Error al obtener proveedores cotizantes");
        if (response.status === 204) return [];
        return response.json();
    },

    // GET /api/abastecimiento/solicitudes/{id}/ofertas/{idProveedor}
    getOfertaProveedor: async (idSolicitud: number, idProveedor: number): Promise<DetalleOferta[]> => {
        const response = await fetch(`${API_URL}/solicitudes/${idSolicitud}/ofertas/${idProveedor}`);
        if (!response.ok) throw new Error("Error al obtener oferta del proveedor");
        return response.json();
    },

    // POST /api/abastecimiento/ordenes-compra/generar
    generarOrdenesCompra: async (data: GenerarOrdenCompraRequest): Promise<string> => {
        const response = await fetch(`${API_URL}/ordenes-compra/generar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
             const errorText = await response.text();
            throw new Error(errorText || "Error al generar órdenes de compra");
        }
        return response.text();
    },

    // ==========================================
    // 5. RECEPCIÓN Y ALMACÉN
    // ==========================================

    // GET /api/abastecimiento/ordenes-compra/pendientes-recepcion
    getOrdenesPendientesRecepcion: async (): Promise<OrdenPendienteRecepcion[]> => {
        const response = await fetch(`${API_URL}/ordenes-compra/pendientes-recepcion`);
        if (!response.ok) throw new Error("Error al obtener órdenes pendientes");
        if (response.status === 204) return [];
        return response.json();
    },

    // GET /api/abastecimiento/ordenes-compra/{id}/productos-programables?modalidad=...
    getProductosProgramables: async (idOrden: number, modalidad: string): Promise<ProductoProgramable[]> => {
        const response = await fetch(`${API_URL}/ordenes-compra/${idOrden}/productos-programables?modalidad=${encodeURIComponent(modalidad)}`);
        
        if (!response.ok) throw new Error("Error al obtener productos programables");
        if (response.status === 204) return [];
        return response.json();
    },

    // POST /api/abastecimiento/recepciones/programar
    programarRecepcion: async (data: ProgramarRecepcionRequest): Promise<string> => {
        const response = await fetch(`${API_URL}/recepciones/programar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
             const errorText = await response.text();
            throw new Error(errorText || "Error al programar recepción");
        }
        return response.text();
    }
};