// ==========================================
// 1. GESTIÓN DE PEDIDOS
// ==========================================

// DTO: ProveedorDto
export interface Proveedor {
    cod_proveedor: number;
    nombre_comercial: string;
    razon_social: string;
    ruc: string;
}

// DTO: ProductoCatalogoDto
export interface ProductoCatalogo {
    cod_producto: number;
    nombre_producto: string;
    rubro: string;
    familia: string;
    clase: string;
    marca: string;
    unidad_medida: string;
    precio_base: number;
}

// Para la lista principal de pedidos (DTO: PedidoAbastecimientoDto)
export interface PedidoAbastecimiento {
    cod_pedido: number;
    fecha_pedido: string;
    hora_pedido: string;
    estado_pedido: string;
}

// Para el detalle de un pedido específico (DTO: PedidoDetalleItemDto)
export interface PedidoDetalleItem {
    nombre_producto: string;
    cantidad_requerida: number;
    unidad_medida: string;
    fecha_requerida: string;
    tipo_destino: string;
    direccion_destino_externo: string;
}

// Cabecera + Detalle del pedido (DTO: PedidoDetalleDto)
export interface PedidoDetalle {
    // Cabecera
    cod_pedido: number;
    fecha_pedido: string;
    hora_pedido: string;
    estado_pedido: string;
    valor_area: string;
    
    // Lista de items
    productos: PedidoDetalleItem[];
}

// ==========================================
// 2. SOLICITUD DE COTIZACIÓN (SC)
// ==========================================

// Items seleccionados para crear una SC (DTO: ItemSeleccionadoDto)
export interface ItemSeleccionado {
    cod_pedido: number;
    cod_producto: number;
    cantidad: number;
}

// Request para generar la SC (DTO: GenerarSolicitudRequestDto)
export interface GenerarSolicitudRequest {
    cod_usuario: number;
    itemsSeleccionados: ItemSeleccionado[];
}

// Lista de Solicitudes generadas (DTO: SolicitudCotizacionDto)
export interface SolicitudCotizacion {
    cod_solicitud: number;
    fecha_emision: string;
    estado: string;
    total_de_items: number;
}

// Items que están esperando ser cotizados (DTO: ItemPendienteCotizacionDto)
export interface ItemPendienteCotizacion {
    nombre_producto: string;
    cod_pedido: number;
    cantidad_requerida: number;
    unidad_medida: string;
    fecha_requerida: string;
    cod_producto: number;
}

// Productos dentro de una solicitud (DTO: ProductoParaCotizarDto)
export interface ProductoParaCotizar {
    cod_producto: number;
    nombre_producto: string;
    cantidad_solicitada: number;
    unidad_medida: string;
}

// ==========================================
// 3. REGISTRO DE COTIZACIONES (PROVEEDORES)
// ==========================================

// Búsqueda de proveedores (DTO: ProveedorBusquedaDto)
export interface ProveedorBusqueda {
    cod_proveedor: number;
    nombre_comercial: string;
}

// Item individual al registrar una cotización (DTO: CotizacionItemRequestDto)
export interface CotizacionItemRequest {
    cod_producto: number;
    costo_total: number; // BigDecimal en Java -> number en TS
    modalidad_pago: string;
}

// Request para guardar la cotización completa (DTO: RegistrarCotizacionRequestDto)
export interface RegistrarCotizacionRequest {
    cod_solicitud: number;
    
    // Datos del formulario
    cod_proveedor: number;
    fecha_emision_cotizacion: string;
    fecha_garantia: string;
    plazo_entrega: number;
    monto_total: number;

    // Tabla de precios
    productosCotizados: CotizacionItemRequest[];
}

// Para visualizar ofertas recibidas (DTO: DetalleOfertaDto)
export interface DetalleOferta {
    cod_producto: number;
    nombre_producto: string;
    cantidad_solicitada: number;
    unidad_medida: string;
    costo_total: number;
    modalidad_pago: string;
}

// ==========================================
// 4. ORDEN DE COMPRA (OC)
// ==========================================

// Item adjudicado (ganador) para la OC (DTO: ItemAdjudicacionDto)
export interface ItemAdjudicacion {
    cod_proveedor: number;
    cod_producto: number;
    cantidad_comprada: number;
    costo_total: number;
    modalidad_pago: string;
}

// Request para generar la OC (DTO: GenerarOrdenCompraRequestDto)
export interface GenerarOrdenCompraRequest {
    cod_solicitud: number;
    items_adjudicados: ItemAdjudicacion[];
}

// Lista de Órdenes pendientes de entrar a almacén (DTO: OrdenPendienteRecepcionDto)
export interface OrdenPendienteRecepcion {
    cod_orden: number;
    nombre_comercial: string;
    fecha_emision: string;
    estado: string;
}

// ==========================================
// 5. RECEPCIÓN Y ALMACÉN
// ==========================================

// Productos listos para programar recepción (DTO: ProductoProgramableDto)
export interface ProductoProgramable {
    cod_producto: number;
    nombre_producto: string;
    unidad_medida: string;
    cantidad_pendiente: number;
    tipo_destino: string;
}

// Item sencillo para la request de programación (DTO: ItemProgramacionDto)
export interface ItemProgramacion {
    cod_producto: number;
    cantidad_a_programar: number;
}

// Request final para programar la recepción (DTO: ProgramarRecepcionRequestDto)
export interface ProgramarRecepcionRequest {
    cod_orden: number;
    
    // Logística
    modalidad_logistica: string; // 'Entrega en Almacén' | 'Recojo por Transporte Propio'
    fecha_programada: string;    // YYYY-MM-DD
    hora_programada: string;     // HH:mm
    
    // Opcional
    cod_instalacion?: string;    // Puede ser null/undefined
    
    // Items
    items: ItemProgramacion[];
}