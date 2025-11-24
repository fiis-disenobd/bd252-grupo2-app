package pe.edu.uni.ProyectoFerreteria.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import pe.edu.uni.ProyectoFerreteria.dto.CotizacionItemRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.DetalleOfertaDto;
import pe.edu.uni.ProyectoFerreteria.dto.GenerarOrdenCompraRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.GenerarSolicitudRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.ItemAdjudicacionDto;
import pe.edu.uni.ProyectoFerreteria.dto.ItemPendienteCotizacionDto;
import pe.edu.uni.ProyectoFerreteria.dto.ItemProgramacionDto;
import pe.edu.uni.ProyectoFerreteria.dto.ItemSeleccionadoDto;
import pe.edu.uni.ProyectoFerreteria.dto.OrdenPendienteRecepcionDto;
import pe.edu.uni.ProyectoFerreteria.dto.PedidoAbastecimientoDto;
import pe.edu.uni.ProyectoFerreteria.dto.PedidoDetalleDto;
import pe.edu.uni.ProyectoFerreteria.dto.PedidoDetalleItemDto;
import pe.edu.uni.ProyectoFerreteria.dto.ProductoCatalogoDto;
import pe.edu.uni.ProyectoFerreteria.dto.ProductoParaCotizarDto;
import pe.edu.uni.ProyectoFerreteria.dto.ProductoProgramableDto;
import pe.edu.uni.ProyectoFerreteria.dto.ProgramarRecepcionRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.ProveedorBusquedaDto;
import pe.edu.uni.ProyectoFerreteria.dto.ProveedorDto;
import pe.edu.uni.ProyectoFerreteria.dto.RegistrarCotizacionRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.SolicitudCotizacionDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ConsultasAbastecimientoService {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    
    public List<ProveedorDto> listarProveedores() {
        String sql = """
        	SELECT 
			    cod_proveedor,
			    nombre_comercial,
			    razon_social,
			    RUC
			FROM 
			    PROVEEDOR
			ORDER BY 
			    nombre_comercial;
        """;

        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(ProveedorDto.class));
    }
    
    public List<ProductoCatalogoDto> listarCatalogoProductos() {
        String sql = """
        	SELECT
			    P.cod_producto,
			    P.nombre_producto,
			    C.rubro,
			    C.familia,
			    C.clase,
			    P.marca,
			    P.unidad_medida,
			    P.precio_base
			FROM
			    MODULO_ABASTECIMIENTO.PRODUCTO P
			JOIN
			    MODULO_ABASTECIMIENTO.CATEGORIA C ON P.cod_categoria = C.cod_categoria
			ORDER BY
			    P.nombre_producto;
        """;

        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(ProductoCatalogoDto.class));
    }
    
    /* 
       ==========================================
       R-404: REVISAR PEDIDO DE ABASTECIMIENTO
       ==========================================
    */

    // ==========================================
    // PANTALLA 1: LISTADO DE PEDIDOS
    // ==========================================
    public List<PedidoAbastecimientoDto> listarPedidosResumen() {
        String sql = """
        	SELECT
			    cod_pedido,
			    fecha_pedido,
			    hora_pedido,
			    estado_pedido
			FROM
			    PEDIDO_ABASTECIMIENTO
			ORDER BY
			    fecha_pedido DESC, hora_pedido DESC;
        """;

        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(PedidoAbastecimientoDto.class));
    }

    // ==========================================
    // PANTALLA 2: DETALLE DE PEDIDO
    // ==========================================
    public PedidoDetalleDto obtenerPedidoCompleto(Integer idPedido) {
    	PedidoDetalleDto cabecera = new PedidoDetalleDto();

        String sqlCabecera = """
            SELECT
			    PA.cod_pedido,
			    PA.fecha_pedido,
			    PA.hora_pedido,
			    PA.estado_pedido,
			    A.valor_area
			FROM
			    PEDIDO_ABASTECIMIENTO PA
			JOIN
			    USUARIO U ON PA.cod_usuario = U.cod_usuario
			JOIN
			    AREA A ON U.cod_area = A.cod_area
			WHERE
				PA.cod_pedido = ?;
        """;

        try {
            cabecera = jdbcTemplate.queryForObject(sqlCabecera, 
                    new BeanPropertyRowMapper<>(PedidoDetalleDto.class), idPedido);
        } catch (Exception e) {
            return null;
        }

        String sqlItems = """
            SELECT 
                pr.nombre_producto,
                dp.cantidad_requerida,
                pr.unidad_medida,
                dp.fecha_requerida,
                dp.tipo_destino,
                dp.direccion_destino_externo
            FROM detalle_pedido dp
            JOIN producto pr ON dp.cod_producto = pr.cod_producto
            WHERE dp.cod_pedido = ?
        """;

        List<PedidoDetalleItemDto> items = jdbcTemplate.query(sqlItems, 
                new BeanPropertyRowMapper<>(PedidoDetalleItemDto.class), idPedido);

        if (cabecera != null) {
            cabecera.setProductos(items);
        }

        return cabecera;
    }
    
    // ==========================================
    // ACCIÓN: MARCAR COMO REVISADO
    // ==========================================
    public void actualizarEstadoRevisadoPedido(Integer idPedido) {
        String sql = """
            UPDATE PEDIDO_ABASTECIMIENTO 
            SET estado_pedido = 'Revisado'
            WHERE cod_pedido = ?
        """;
        
        jdbcTemplate.update(sql, idPedido);
        
        String sqlDetalle = """
        			UPDATE detalle_pedido SET estado = 'Revisado' WHERE cod_pedido = ?
        		""";
        jdbcTemplate.update(sqlDetalle, idPedido);
 
    }
    
    /* 
    ==========================================
    R-405: GENERAR SOLICITUD DE COTIZACIÓN
    ==========================================
     */
    
    // =================================================
    // PANTALLA 1: LISTADO DE SOLICITUDES DE COTIZACION
    // =================================================
    public List<SolicitudCotizacionDto> listarSolicitudesCotizacionResumen() {
        String sql = """
        	SELECT
			    SC.cod_solicitud,
			    SC.fecha_emision,
			    SC.estado,
			    COUNT(DS.cod_producto) AS total_de_items
			FROM
			    SOLICITUD_COTIZACION SC
			JOIN
			    DETALLE_SOLICITUD DS ON SC.cod_solicitud = DS.cod_solicitud
			GROUP BY
			    SC.cod_solicitud,
			    SC.fecha_emision,
			    SC.estado
			ORDER BY
			    SC.fecha_emision DESC, SC.cod_solicitud DESC;
        """;

        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(SolicitudCotizacionDto.class));
    }
    
    // =================================================================================
    //              PANTALLA 2: GENERAR SOLICITUD
    // =================================================================================
    
    //LISTADO DE ITEMS PENDIENTES DE COTIZACION
    public List<ItemPendienteCotizacionDto> listarItemsPendientes(String fechaInicio, String fechaFin) {
        String sql = """
            SELECT
			    DP.cod_pedido,
			    DP.cod_producto,
			    P.nombre_producto,
			    DP.cantidad_requerida,
			    P.unidad_medida,
			    DP.fecha_requerida
			FROM
			    DETALLE_PEDIDO DP
			JOIN
			    PRODUCTO P ON DP.cod_producto = P.cod_producto
			WHERE
			    DP.estado = 'Revisado'
        """;
        
        // Caso A: Si hay Fecha Inicio ("Desde...")
        if (fechaInicio != null && !fechaInicio.isEmpty()) {
            sql += " AND DP.fecha_requerida >= TO_DATE('" + fechaInicio + "', 'YYYY-MM-DD')";
        }

        // Caso B: Si hay Fecha Fin ("Hasta...")
        if (fechaFin != null && !fechaFin.isEmpty()) {
            sql += " AND DP.fecha_requerida <= TO_DATE('" + fechaFin + "', 'YYYY-MM-DD')";
        }

        sql += " ORDER BY dp.fecha_requerida ASC";

        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(ItemPendienteCotizacionDto.class));
    }
    
    //GENERAR SOLICITUD
    @Transactional
    public void generarSolicitudCotizacion(GenerarSolicitudRequestDto request) {
        String sqlInsertSolicitud = """
            INSERT INTO solicitud_cotizacion (cod_usuario, estado, fecha_emision) 
            VALUES (?, 'Enviada', CURRENT_DATE) 
            RETURNING cod_solicitud
        """;
        
        int idUsuario = (request.getCod_usuario() != null) ? request.getCod_usuario() : 1;
        
        Integer idSolicitud = jdbcTemplate.queryForObject(sqlInsertSolicitud, Integer.class, idUsuario);

        String sqlInsertDetalle = """
            INSERT INTO detalle_solicitud (cod_solicitud, cod_producto, cantidad_solicitada)
            VALUES (?, ?, ?)
        """;

        String sqlUpdateOriginal = """
            UPDATE detalle_pedido 
            SET estado = 'En Cotización' 
            WHERE cod_pedido = ? AND cod_producto = ?
        """;

        for (ItemSeleccionadoDto item : request.getItemsSeleccionados()) {
            jdbcTemplate.update(sqlInsertDetalle, idSolicitud, item.getCod_producto(), item.getCantidad());

            jdbcTemplate.update(sqlUpdateOriginal, item.getCod_pedido(), item.getCod_producto());
        }
    }
    
    /*
     =================================================================================
               R-406: REGISTRAR COTIZACIONES RECIBIDAS
     =================================================================================
     */

	// =================================================
    // PANTALLA 1
    // =================================================
    // 1. BUSCADOR DE PROVEEDORES
    public List<ProveedorBusquedaDto> buscarProveedores(String termino) {
        String sql = """
            SELECT
                cod_proveedor,
                nombre_comercial
            FROM
                proveedor
            WHERE
                LOWER(nombre_comercial) LIKE LOWER(?)
            ORDER BY
                nombre_comercial ASC
            LIMIT 10
        """;
        
        String param = termino + "%";
        
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(ProveedorBusquedaDto.class), param);
    }
    
    // 2. CARGAR TABLA INICIAL
    public List<ProductoParaCotizarDto> obtenerProductosDeSolicitud(Integer idSolicitud) {
        String sql = """
            SELECT 
                p.cod_producto,
                p.nombre_producto,
                ds.cantidad_solicitada,
                p.unidad_medida
            FROM detalle_solicitud ds
            JOIN producto p ON ds.cod_producto = p.cod_producto
            WHERE ds.cod_solicitud = ?
            ORDER BY p.nombre_producto ASC
        """;
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(ProductoParaCotizarDto.class), idSolicitud);
    }

    // 3. GUARDAR EL FORMULARIO
    @Transactional
    public void registrarCotizacion(RegistrarCotizacionRequestDto request) {
    	// A. Insertar Cabecera de Cotización
        String sqlCotizacion = """
            INSERT INTO cotizacion 
            (cod_solicitud, cod_proveedor, fecha_emision_cotizacion, fecha_garantia, monto_total, plazo_entrega)
            VALUES (?, ?, TO_DATE(?, 'YYYY-MM-DD'), TO_DATE(?, 'YYYY-MM-DD'), ?, ?)
            RETURNING cod_cotizacion
        """;

        Integer idCotizacion = jdbcTemplate.queryForObject(sqlCotizacion, Integer.class,
                request.getCod_solicitud(),
                request.getCod_proveedor(),
                request.getFecha_emision_cotizacion(),
                request.getFecha_garantia(),
                request.getMonto_total(),
                request.getPlazo_entrega()
        );

        // B. Insertar Detalles
        String sqlDetalle = """
            INSERT INTO detalle_cotizacion 
            (cod_cotizacion, cod_producto, costo_total, modalidad_pago)
            VALUES (?, ?, ?, ?)
        """;

        for (CotizacionItemRequestDto item : request.getProductosCotizados()) {
            jdbcTemplate.update(sqlDetalle,
                    idCotizacion,
                    item.getCod_producto(),
                    item.getCosto_total(),
                    item.getModalidad_pago()
            );
        }

        // C. Actualizar estado de la Solicitud a "Cotizada"
        String sqlUpdateSolicitud = """
            UPDATE solicitud_cotizacion
            SET estado = 'Cotizada'
            WHERE cod_solicitud = ?
        """;
        jdbcTemplate.update(sqlUpdateSolicitud, request.getCod_solicitud());
        
        // D. Actualizar estado de los ítems originales en cascada
        String sqlUpdateItemsOriginales = """
            UPDATE detalle_pedido
            SET estado = 'Cotizado' 
            WHERE cod_producto IN (
                SELECT cod_producto FROM detalle_solicitud WHERE cod_solicitud = ?
            )
            AND estado = 'En Cotización'
        """;
        jdbcTemplate.update(sqlUpdateItemsOriginales, request.getCod_solicitud());
    }
    
	/*
	  =================================================================================
                 R-407: EVALUAR COTIZACIONES Y GENERAR OC
      =================================================================================
	 */

    // 1. LISTAR PROVEEDORES QUE COTIZARON
    public List<ProveedorBusquedaDto> listarProveedoresConOferta(Integer idSolicitud) {
        String sql = """
            SELECT DISTINCT
                p.cod_proveedor,
                p.nombre_comercial
            FROM cotizacion c
            JOIN proveedor p ON c.cod_proveedor = p.cod_proveedor
            WHERE c.cod_solicitud = ?
        """;

        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(ProveedorBusquedaDto.class), idSolicitud);
    }

    // 2. LISTAR ITEMS DE UNA OFERTA ESPECÍFICA
    public List<DetalleOfertaDto> listarDetalleOferta(Integer idSolicitud, Integer idProveedor) {
        String sql = """
            SELECT 
                p.cod_producto,
                p.nombre_producto,
                ds.cantidad_solicitada,
                p.unidad_medida,
                dc.costo_total,
                dc.modalidad_pago
            FROM detalle_cotizacion dc
            JOIN cotizacion c ON dc.cod_cotizacion = c.cod_cotizacion
            JOIN producto p ON dc.cod_producto = p.cod_producto
            JOIN detalle_solicitud ds ON c.cod_solicitud = ds.cod_solicitud 
                                                  AND dc.cod_producto = ds.cod_producto
            WHERE c.cod_solicitud = ? 
              AND c.cod_proveedor = ?
        """;
        
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(DetalleOfertaDto.class), idSolicitud, idProveedor);
    }

    // 3. GENERAR ÓRDENES DE COMPRA
    @Transactional
    public void generarOrdenesCompra(GenerarOrdenCompraRequestDto request) {
        
        // PASO A: Agrupar los items por "Proveedor + ModalidadPago"
        // Si tienes error aquí, verifica que ItemAdjudicacionDto tenga los getters correctos.
        // Lombok suele generar getCod_proveedor() para cod_proveedor.
        Map<String, List<ItemAdjudicacionDto>> gruposOC = request.getItems_adjudicados().stream()
            .collect(Collectors.groupingBy(item -> item.getCod_proveedor() + "-" + item.getModalidad_pago()));

        String sqlInsertOC = """
            INSERT INTO orden_compra 
            (cod_cotizacion, fecha_emision, monto, modalidad_pago, estado)
            VALUES (?, CURRENT_DATE, ?, ?, 'Emitida')
            RETURNING cod_orden
        """;

        String sqlInsertDetalleOC = """
            INSERT INTO detalle_oc
            (cod_orden, cod_producto, cantidad_comprada, costo_total)
            VALUES (?, ?, ?, ?)
        """;

        String sqlGetIdCotizacion = "SELECT cod_cotizacion FROM cotizacion WHERE cod_solicitud = ? AND cod_proveedor = ?";

        // PASO B: Iterar sobre cada grupo y crear una Orden de Compra
        for (Map.Entry<String, List<ItemAdjudicacionDto>> entrada : gruposOC.entrySet()) {
            String[] clave = entrada.getKey().split("-");
            Integer idProveedor = Integer.parseInt(clave[0]);
            String modalidadPago = clave[1];
            List<ItemAdjudicacionDto> itemsDeEstaOC = entrada.getValue();

            // Calcular monto total de esta OC específica
            BigDecimal montoTotalOC = itemsDeEstaOC.stream()
                    .map(ItemAdjudicacionDto::getCosto_total) // Verifica que este método exista en el DTO
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Obtener el ID de la cotización origen
            Integer idCotizacion = jdbcTemplate.queryForObject(sqlGetIdCotizacion, Integer.class, 
                    request.getCod_solicitud(), idProveedor);

            // 1. Insertar Cabecera OC
            Integer idOrden = jdbcTemplate.queryForObject(sqlInsertOC, Integer.class,
                    idCotizacion,
                    montoTotalOC,
                    modalidadPago
            );

            // 2. Insertar Detalles OC
            for (ItemAdjudicacionDto item : itemsDeEstaOC) {
                jdbcTemplate.update(sqlInsertDetalleOC,
                        idOrden,
                        item.getCod_producto(),
                        item.getCantidad_comprada(),
                        item.getCosto_total()
                );
            }
        }

        // PASO C: Actualizar Estados Finales
        // 1. Solicitud -> Adjudicada
        jdbcTemplate.update("UPDATE solicitud_cotizacion SET estado = 'Adjudicada' WHERE cod_solicitud = ?", 
                request.getCod_solicitud());

        // 2. Ítems Originales -> Adjudicado (Cascada)
        String sqlUpdateCascada = """
            UPDATE detalle_pedido
            SET estado = 'Adjudicado' 
            WHERE cod_producto IN (
                SELECT cod_producto FROM detalle_solicitud WHERE cod_solicitud = ?
            )
            AND estado = 'Cotizado'
        """;
        jdbcTemplate.update(sqlUpdateCascada, request.getCod_solicitud());
    }
    
    /*
	=================================================================================
               R-408: Programar Recepción
    =================================================================================
	 */
    
    //=================================================================================
    //       Pantalla 1
    //============================================
    public List<OrdenPendienteRecepcionDto> listarOrdenesPendientesRecepcion() {
        String sql = """
            SELECT 
                oc.cod_orden,
                p.nombre_comercial,
                oc.fecha_emision,
                oc.estado
            FROM orden_compra oc
            JOIN cotizacion c ON oc.cod_cotizacion = c.cod_cotizacion
            JOIN proveedor p ON c.cod_proveedor = p.cod_proveedor
            WHERE oc.estado = 'Emitida'
            ORDER BY oc.fecha_emision DESC, oc.cod_orden DESC
        """;
        
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(OrdenPendienteRecepcionDto.class));
    }
    
    // 1. LISTAR PRODUCTOS FILTRADOS POR TIPO DE DESTINO
    public List<ProductoProgramableDto> listarProductosParaProgramar(Integer idOrden, String modalidad) {
        // Determinamos qué tipo de destino buscar según la modalidad
        String tipoDestinoBuscado = modalidad.equals("Entrega en Almacén") ? "Interno" : "Externo";

        // SQL Complejo:
        // 1. Parte de la Orden de Compra (OC) y sus detalles.
        // 2. Rastrea hacia atrás (OC -> Cotización -> Solicitud -> Detalle Solicitud) para llegar al Pedido Original.
        // 3. Filtra por el tipo_destino del Pedido Original.
        // 4. Calcula la 'cantidad_pendiente' restando lo que ya se programó en recepciones anteriores.
        
        String sql = """
            SELECT 
                p.cod_producto,
                p.nombre_producto,
                p.unidad_medida,
                -- Cálculo de Pendiente: (Lo comprado) - (Lo que ya se programó en otras recepciones)
                (doc.cantidad_comprada - COALESCE((
                    SELECT SUM(dr.cantidad_programada)
                    FROM detalle_recepcion dr
                    JOIN recepcion r ON dr.cod_recepcion = r.cod_recepcion
                    WHERE r.cod_orden = doc.cod_orden AND dr.cod_producto = doc.cod_producto
                ), 0)) AS cantidad_pendiente,
                dp.tipo_destino
            FROM detalle_oc doc
            JOIN producto p ON doc.cod_producto = p.cod_producto
            -- JOINS para llegar al Tipo de Destino en Detalle Pedido
            JOIN orden_compra oc ON doc.cod_orden = oc.cod_orden
            JOIN cotizacion c ON oc.cod_cotizacion = c.cod_cotizacion
            JOIN detalle_solicitud ds ON c.cod_solicitud = ds.cod_solicitud AND doc.cod_producto = ds.cod_producto
            JOIN detalle_pedido dp ON ds.cod_solicitud = (
                -- Subquery para enlazar con el pedido original es compleja, simplificamos asumiendo trazabilidad por producto y estado
                SELECT ds_inner.cod_solicitud FROM detalle_solicitud ds_inner WHERE ds_inner.cod_solicitud = c.cod_solicitud LIMIT 1
            ) AND dp.cod_producto = doc.cod_producto
            
            WHERE doc.cod_orden = ?
              AND dp.tipo_destino = ?
              -- AND dp.estado = 'Adjudicado'
        """;

        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(ProductoProgramableDto.class), idOrden, tipoDestinoBuscado);
    }

    // 2. GUARDAR PROGRAMACIÓN (CONFIRMAR)
    @Transactional
    public void registrarProgramacionRecepcion(ProgramarRecepcionRequestDto request) {
        // A. Insertar Cabecera de Recepción
        // Nota: Si es transporte, cod_instalacion vendrá null o no se usa. 
        // Si tu BD obliga cod_instalacion, debes manejar un valor dummy o permitir nulos en la tabla.
        // Asumiremos que tu tabla RECEPCION permite cod_instalacion NULL para Transporte o tienes lógica para ello.
        // Basado en tu script: cod_instalacion VARCHAR(10) NOT NULL REFERENCES instalacion.
        // AJUSTE: Si es transporte, necesitaremos un código de instalación "virtual" o logística.
        // Por ahora, usaré el valor que envíe el front (si es Transporte, el front podría no enviar nada, ojo ahí).
        
        String sqlRecepcion = """
            INSERT INTO recepcion 
            (cod_orden, cod_instalacion, fecha_programada, hora_programada, modalidad_logistica, estado_recepcion, hora_inicio_recepcion, hora_fin_recepcion)
            VALUES (?, ?, TO_DATE(?, 'YYYY-MM-DD'), TO_TIMESTAMP(?, 'HH24:MI'), ?, 'Programada', '00:00', '00:00')
            RETURNING cod_recepcion
        """;

        // Validación de seguridad para Transporte (si no hay almacén, asignamos uno por defecto o manejamos el error)
        String instalacion = request.getCod_instalacion();
        if ("Recojo por Transporte Propio".equals(request.getModalidad_logistica()) && (instalacion == null || instalacion.isEmpty())) {
            // Asignamos un valor dummy si tu BD lo requiere obligatoriamente, o el front debe enviar algo.
            // Supongamos que para transporte no aplica almacén físico de recepción inmediata.
            // Revisa tu restricción NOT NULL en BD. Si es estricta, necesitas un 'TR-VIRTUAL'.
            instalacion = "ALM-MAIN"; // Valor por defecto temporal para evitar crash si no envías nada
        }

        Integer idRecepcion = jdbcTemplate.queryForObject(sqlRecepcion, Integer.class,
                request.getCod_orden(),
                instalacion,
                request.getFecha_programada(),
                request.getHora_programada(),
                request.getModalidad_logistica()
        );

        // B. Insertar Detalles
        String sqlDetalle = """
            INSERT INTO detalle_recepcion 
            (cod_recepcion, cod_producto, cantidad_programada, cantidad_recibida, cantidad_conforme, cantidad_defectuosa)
            VALUES (?, ?, ?, 0, 0, 0)
        """;

        for (ItemProgramacionDto item : request.getItems()) {
            if (item.getCantidad_a_programar() > 0) {
                jdbcTemplate.update(sqlDetalle,
                        idRecepcion,
                        item.getCod_producto(),
                        item.getCantidad_a_programar()
                );
            }
        }

        // C. VERIFICACIÓN DE ESTADO DE LA ORDEN (¿Ya se programó todo?)
        verificarYActualizarEstadoOrden(request.getCod_orden());
    }

    private void verificarYActualizarEstadoOrden(Integer idOrden) {
        // 1. Calcular total comprado en la OC
        String sqlTotalComprado = "SELECT SUM(cantidad_comprada) FROM detalle_oc WHERE cod_orden = ?";
        Integer totalComprado = jdbcTemplate.queryForObject(sqlTotalComprado, Integer.class, idOrden);

        // 2. Calcular total programado en todas las recepciones de esta OC
        String sqlTotalProgramado = """
            SELECT COALESCE(SUM(dr.cantidad_programada), 0)
            FROM detalle_recepcion dr
            JOIN recepcion r ON dr.cod_recepcion = r.cod_recepcion
            WHERE r.cod_orden = ?
        """;
        Integer totalProgramado = jdbcTemplate.queryForObject(sqlTotalProgramado, Integer.class, idOrden);

        // 3. Si ya programamos todo (o más), cambiamos el estado
        if (totalProgramado >= totalComprado) {
            String sqlUpdateOrden = "UPDATE orden_compra SET estado = 'Programada' WHERE cod_orden = ?";
            jdbcTemplate.update(sqlUpdateOrden, idOrden);
        }
    }
    
    
}