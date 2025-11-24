package pe.edu.uni.ProyectoFerreteria.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.Data;
import pe.edu.uni.ProyectoFerreteria.dto.AnulacionDto;
import pe.edu.uni.ProyectoFerreteria.dto.AnulacionRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.AnulacionResponseDto;
import pe.edu.uni.ProyectoFerreteria.dto.CambioProdDto;
import pe.edu.uni.ProyectoFerreteria.dto.CambioProductoRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.CambioProductoResponseDto;
import pe.edu.uni.ProyectoFerreteria.dto.CronogramaCabeceraDto;
import pe.edu.uni.ProyectoFerreteria.dto.CronogramaDetalleDto;
import pe.edu.uni.ProyectoFerreteria.dto.CronogramaPagoDto;
import pe.edu.uni.ProyectoFerreteria.dto.DetalleVentaCabeceraDto;
import pe.edu.uni.ProyectoFerreteria.dto.DetalleVentaDto;
import pe.edu.uni.ProyectoFerreteria.dto.DetalleVentaProdDto;
import pe.edu.uni.ProyectoFerreteria.dto.DevolucionDto;
import pe.edu.uni.ProyectoFerreteria.dto.DevolucionRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.DevolucionResponseDto;
import pe.edu.uni.ProyectoFerreteria.dto.ItemVentaDto;
import pe.edu.uni.ProyectoFerreteria.dto.ListadoVentasDto;
import pe.edu.uni.ProyectoFerreteria.dto.PagoPendienteDto;
import pe.edu.uni.ProyectoFerreteria.dto.PagoRealizadoDto;
import pe.edu.uni.ProyectoFerreteria.dto.PagoRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.PagoResponseDto;
import pe.edu.uni.ProyectoFerreteria.dto.VentaRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.VentaResponseDto;

@Service
public class ConsultasVentasService {
	
	@Autowired
    private JdbcTemplate jdbcTemplate;
	
    // ==========================================
    // PANEL PRINCIPAL: LISTADO DE VENTAS
    // ==========================================
	public List<ListadoVentasDto> listadoVentas() {
	    String sql = """	
	        SELECT v.cod_venta_fmt venta,
	               p.nombre_persona vendedor,
	               date(v.fecha_hora_venta) fecha,
	               to_char(v.fecha_hora_venta, 'HH24:MI:SS') hora,
	               'S/ ' || TO_CHAR(v.monto_venta, 'FM999,999,999,999.00') monto,
	               ev.descp_estado_venta estado
	        FROM venta v
	        INNER JOIN vendedor ve ON v.cod_vendedor = ve.cod_vendedor
	        JOIN usuario u ON u.cod_usuario = ve.cod_usuario
	        JOIN persona p ON p.cod_persona = u.cod_persona
	        INNER JOIN estado_venta ev ON ev.cod_estado_venta = v.cod_estado_venta;
	        """;

	    return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(ListadoVentasDto.class));
	}
	
	// ==========================================
    // DETALLES DE VENTAS
    // ==========================================
	public DetalleVentaDto detalleVentas(Integer idVenta) {
	
		String sqlCabecera = """	
	        SELECT pc.nombre_persona cliente, v.fecha_hora_venta fecha_hora,
			pv.nombre_persona vendedor, cp.descp_cond_pago condicion_pago
			FROM venta v
			LEFT JOIN condicion_pago cp
			ON cp.cod_cond_pago = v.cod_cond_pago
			LEFT JOIN vendedor ven 
			ON ven.cod_vendedor = v.cod_vendedor
			LEFT JOIN usuario u
			ON u.cod_usuario = ven.cod_usuario
			LEFT JOIN persona pv
			ON pv.cod_persona = u.cod_persona
			LEFT JOIN cliente c
			ON c.cod_cliente = v.cod_cliente
			LEFT JOIN persona pc
			ON pc.cod_persona = c.cod_persona
			WHERE v.cod_venta = ?;
		        """;
		
		String sqlDetalles = """	
	        SELECT p.cod_producto_fmt producto, p.nombre_producto descripcion, 
	        pv.cantidad_producto cantidad, p.precio_venta precio, pv.descuento_unitario descuento, 
	        p.puntos_producto*pv.cantidad_producto puntos, pv.monto_unitario monto,
	        epv.descp_estado_prodv estado, pv.direccion_entrega, pv.fecha_entrega
	    		FROM producto_venta pv LEFT JOIN producto p
	    		ON p.cod_producto = pv.cod_producto LEFT JOIN estado_producto_venta epv 
	    		ON epv.cod_estado_prodv = pv.cod_estado_prodv
	    		WHERE pv.cod_venta = ?;
	        """;

		try {
	        DetalleVentaCabeceraDto cabecera = jdbcTemplate.queryForObject(
	            sqlCabecera,
	            new BeanPropertyRowMapper<>(DetalleVentaCabeceraDto.class),
	            idVenta
	        );

	        List<DetalleVentaProdDto> detalles = jdbcTemplate.query(
	            sqlDetalles,
	            new BeanPropertyRowMapper<>(DetalleVentaProdDto.class),
	            idVenta
	        );

	        if (cabecera == null || detalles == null || detalles.isEmpty()) {
	            return null; // o lanza una excepción si prefieres
	        }

	        DetalleVentaDto resp = new DetalleVentaDto();
	        resp.setCabecera(cabecera);
	        resp.setDetalles(detalles);
	        return resp;

	    } catch (EmptyResultDataAccessException e) {
	        return null;
	    } catch (Exception e) {
	        e.printStackTrace();
	        throw e; // para que el controller devuelva 500
	    }
	}
	
	public List<PagoRealizadoDto> verPagosRealizados() {
		String sql = """	
	        SELECT v.cod_venta_fmt venta, p.nro_cuota || ' de ' || v.nro_cuotas cuota,
			date(p.fecha_pago) fecha, 'S/. ' || p.monto_pago monto FROM pago p
			LEFT JOIN venta v 
			ON v.cod_venta = p.cod_venta
			WHERE p.cod_estado_pago = 2
			ORDER BY p.cod_pago;
		        """;

		    return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(PagoRealizadoDto.class));
	}
	
	public List<PagoPendienteDto> verPagosPendientes() {
		String sql = """	
	        SELECT v.cod_venta_fmt venta, p2.nombre_persona cliente, p.nro_cuota || ' de ' || v.nro_cuotas cuota,
			p.fecha_vencimiento_pago fecha_vencimiento, 'S/. ' || p.monto_pago monto, ep.nombre_estado_pago condicion FROM pago p
			LEFT JOIN venta v 
			ON v.cod_venta = p.cod_venta
			LEFT JOIN estado_pago ep 
			ON ep.cod_estado_pago = p.cod_estado_pago
			LEFT JOIN cliente c 
			ON c.cod_cliente = v.cod_cliente
			LEFT JOIN persona p2 
			ON p2.cod_persona = c.cod_persona 
			WHERE p.cod_estado_pago = 1 OR p.cod_estado_pago = 3
			ORDER BY p.cod_pago;
		        """;

		    return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(PagoPendienteDto.class));
	}
	
	public List<DevolucionDto> verDevoluciones() {
		String sql = """	
	        SELECT d.cod_devolucion_fmt devolucion, v.cod_venta_fmt venta, 
			p.nombre_producto, d.monto_devolucion monto_devuelto, 
			md.descp_motivo_devolucion motivo_devolucion FROM devolucion d
			LEFT JOIN reclamo r
			ON r.cod_reclamo = d.cod_reclamo
			LEFT JOIN venta v
			ON v.cod_venta = r.cod_venta
			LEFT JOIN motivo_devolucion md 
			ON md.cod_motivo_devolucion = d.cod_motivo_devolucion
			LEFT JOIN producto p 
			ON p.cod_producto = d.producto_devuelto;
		        """;

		    return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(DevolucionDto.class));
	}
	
	public List<CambioProdDto> verCambiosProd() {
		String sql = """	
	        SELECT cp.cod_cp_fmt cambio_prod, v.cod_venta_fmt venta, p3.nombre_persona cliente, 
			p1.nombre_producto producto_devuelto, p2.nombre_producto producto_nuevo, 
			cp.diferencia_cambio diferencia, date(cp.fecha_hora_cp) fecha
			FROM cambio_producto cp
			LEFT JOIN reclamo r 
			ON r.cod_reclamo = cp.cod_reclamo
			LEFT JOIN venta v
			ON v.cod_venta = r.cod_venta
			LEFT JOIN producto p1
			ON p1.cod_producto = cp.producto_retorna 
			LEFT JOIN producto p2
			ON p2.cod_producto = cp.producto_entrega
			LEFT JOIN cliente c 
			ON c.cod_cliente = v.cod_cliente
			LEFT JOIN persona p3 
			ON p3.cod_persona = c.cod_persona;
		        """;

		    return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(CambioProdDto.class));
	}
	
	public List<AnulacionDto> verAnulaciones() {
		String sql = """	
	        SELECT a.cod_anulacion_fmt anulacion, pc.nombre_persona cliente, pv.nombre_persona vendedor, 
			date(a.fecha_hora_anulacion) fecha, v.monto_venta monto, 
			ma.descp_motivo_anulacion motivo FROM anulacion a
			LEFT JOIN reclamo r
			ON r.cod_reclamo = a.cod_reclamo
			LEFT JOIN venta v
			ON v.cod_venta = r.cod_venta
			LEFT JOIN vendedor ven 
			ON ven.cod_vendedor = v.cod_vendedor
			LEFT JOIN usuario u
			ON u.cod_usuario = ven.cod_usuario
			LEFT JOIN persona pv
			ON pv.cod_persona = u.cod_persona
			LEFT JOIN cliente c
			ON c.cod_cliente = v.cod_cliente
			LEFT JOIN persona pc
			ON pc.cod_persona = c.cod_persona
			LEFT JOIN motivo_anulacion ma 
			ON ma.cod_motivo_anulacion = a.cod_motivo_anulacion;
		        """;

		    return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(AnulacionDto.class));
	}
	
	public CronogramaPagoDto verCronogramaPago(Integer idVenta) {
		
		String sqlCabecera = """	
	        SELECT v.cod_venta_fmt venta, pc.nombre_persona cliente, v.fecha_hora_venta fecha_hora,
			pv.nombre_persona vendedor
			FROM venta v
			LEFT JOIN vendedor ven 
			ON ven.cod_vendedor = v.cod_vendedor
			LEFT JOIN usuario u
			ON u.cod_usuario = ven.cod_usuario
			LEFT JOIN persona pv
			ON pv.cod_persona = u.cod_persona
			LEFT JOIN cliente c
			ON c.cod_cliente = v.cod_cliente
			LEFT JOIN persona pc
			ON pc.cod_persona = c.cod_persona
			WHERE v.cod_venta = ?;
		        """;
		
		String sqlPagos = """	
	        SELECT p.fecha_vencimiento_pago fecha_vencimiento, p.monto_pago monto_pago, date(p.fecha_pago) fecha_pago,
			mp.descp_metodo_pago metodo_pago, c.nro_comprobante num_comprobante, 
			tc.descp_tipo_comprobante tipo_comprobante  FROM pago p
			LEFT JOIN metodo_pago mp 
			ON mp.cod_metodo_pago = p.cod_metodo_pago 
			LEFT JOIN comprobante c
			ON c.cod_comprobante = p.cod_comprobante
			LEFT JOIN tipo_comprobante tc 
			ON tc.cod_tipo_comprobante = c.cod_tipo_comprobante
			WHERE p.cod_venta = ?;
	        """;

		try {
	        CronogramaCabeceraDto cabecera = jdbcTemplate.queryForObject(
	            sqlCabecera,
	            new BeanPropertyRowMapper<>(CronogramaCabeceraDto.class),
	            idVenta
	        );

	        List<CronogramaDetalleDto> pagos = jdbcTemplate.query(
	            sqlPagos,
	            new BeanPropertyRowMapper<>(CronogramaDetalleDto.class),
	            idVenta
	        );

	        if (cabecera == null || pagos == null || pagos.isEmpty()) {
	            return null; // o lanza una excepción si prefieres
	        }

	        CronogramaPagoDto resp = new CronogramaPagoDto();
	        resp.setCabecera(cabecera);
	        resp.setPagos(pagos);
	        return resp;

	    } catch (EmptyResultDataAccessException e) {
	        return null;
	    } catch (Exception e) {
	        e.printStackTrace();
	        throw e; // para que el controller devuelva 500
	    }
	}
	
	@Transactional
	public VentaResponseDto registrarVenta(VentaRequestDto request) {

	    // 1. Crear venta base (montos en 0)
	    String sqlInsertVenta = """
	        INSERT INTO venta (
	            monto_venta, igv, descuento, puntos_venta,
	            cod_estado_venta, cod_cond_pago, nro_cuotas, cod_cliente, cod_vendedor
	        )
	        VALUES (0, 0, 0, 0, 2, ?, ?, ?, ?)
	        RETURNING cod_venta
	        """;

	    Integer codVenta = jdbcTemplate.queryForObject(
	            sqlInsertVenta,
	            Integer.class,
	            request.getCod_cond_pago(),
	            request.getNro_cuotas(),
	            request.getCod_cliente(),
	            request.getCod_vendedor()
	    );

	    // 2. Insertar ítems de venta
	    String sqlInsertItem = """
	        INSERT INTO producto_venta (
	            cod_venta, cod_producto, cantidad_producto,
	            precio_unitario, descuento_unitario, monto_unitario, puntos_unitario,
	            cod_estado_prodv, direccion_entrega, fecha_entrega
	        )
	        VALUES (
	            ?, ?, ?, 
	            precio_unitario(?), 
	            ?, 
	            precio_unitario(?) * ?, 
	            puntos_producto(?) * ?, 
	            ?, 
	            ?, 
	            ?::date
	        )
	        """;

	    List<ItemVentaDto> items = request.getItems();
	    for (ItemVentaDto item : items) {

	        jdbcTemplate.update(
	                sqlInsertItem,
	                codVenta,
	                item.getCod_producto(),
	                item.getCantidad(),
	                item.getCod_producto(),
	                item.getDescuento_unitario() != null ? item.getDescuento_unitario() : 0f,
	                item.getCod_producto(),
	                item.getCantidad(),
	                item.getCod_producto(),
	                item.getCantidad(),
	                item.getCod_estado_prodv() != null ? item.getCod_estado_prodv() : 1,
	                item.getDireccion_entrega(),
	                item.getFecha_entrega()
	        );
	    }

	    // 3. Actualizar totales
	    String sqlUpdateTotales = """
	        UPDATE venta
	        SET monto_venta = calcular_monto_venta(?),
	            igv = calcular_igv_venta(?),
	            descuento = calcular_dscto_venta(?),
	            puntos_venta = calcular_puntos_venta(?)
	        WHERE cod_venta = ?
	        """;

	    jdbcTemplate.update(
	            sqlUpdateTotales,
	            codVenta, codVenta, codVenta, codVenta, codVenta
	    );

	    // 4. Actualizar contador de ventas del vendedor
	    String sqlUpdateVendedor = """
	        UPDATE vendedor
	        SET total_ventas_vendedor = total_ventas_vendedor + 1
	        WHERE cod_vendedor = ?
	        """;

	    jdbcTemplate.update(sqlUpdateVendedor, request.getCod_vendedor());

	    // 5. Insertar comprobante y obtener el ID correcto
	    String sqlInsertComprobante = """
	        INSERT INTO comprobante (
	            cod_tipo_comprobante,
	            nro_comprobante,
	            fecha_emision
	        )
	        VALUES (?, ?, now())
	        RETURNING cod_comprobante
	        """;

	    Integer codComprobante = jdbcTemplate.queryForObject(
	            sqlInsertComprobante,
	            Integer.class,
	            request.getCod_tipo_comprobante(),
	            request.getNro_comprobante()
	    );

	    // 6. Insertar primer pago
	    String sqlInsertPrimerPago = """
	        INSERT INTO pago (
	            cod_venta, nro_cuota, monto_pago,
	            fecha_vencimiento_pago, fecha_pago,
	            nombre_pagador, nro_telf_pagador,
	            cod_caja, cod_comprobante,
	            cod_estado_pago, cod_metodo_pago
	        )
	        VALUES (
	            ?, 1, primer_pago(?),
	            current_date, current_date,
	            ?, ?, ?, ?, 2, ?
	        )
	        """;

	    jdbcTemplate.update(
	            sqlInsertPrimerPago,
	            codVenta,
	            codVenta,
	            request.getNombre_pagador(),
	            request.getNro_telf_pagador(),
	            request.getCod_caja(),
	            codComprobante,
	            request.getCod_metodo_pago()
	    );

	    // 7. Generar pagos restantes (corregido: no usar Void.class)
	    String sqlGenerarPagos = "SELECT generar_pagos_restantes(?)";

	    jdbcTemplate.query(
	            sqlGenerarPagos,
	            rs -> {},   // Ignora el resultado
	            codVenta
	    );

	    // 8. Resumen de venta para respuesta
	    String sqlResumen = """
	        SELECT cod_venta, monto_venta, igv, descuento, puntos_venta
	        FROM venta
	        WHERE cod_venta = ?
	        """;

	    VentaResponseDto response = jdbcTemplate.queryForObject(
	            sqlResumen,
	            new BeanPropertyRowMapper<>(VentaResponseDto.class),
	            codVenta
	    );

	    response.setMensaje("Venta registrada correctamente.");
	    return response;
	}

	

    @Transactional
    public PagoResponseDto registrarPago(PagoRequestDto request) {

        // 1. Obtener la próxima cuota pendiente
        String sqlCuotaPendiente = """
            SELECT cod_pago, nro_cuota, monto_pago
            FROM pago
            WHERE cod_venta = ?
              AND cod_estado_pago IN (1,3)
            ORDER BY nro_cuota ASC
            LIMIT 1
            """;

        List<PendienteDto> pendientes = jdbcTemplate.query(
            sqlCuotaPendiente,
            (rs, rowNum) -> {
                PendienteDto p = new PendienteDto();
                p.setCod_pago(rs.getInt("cod_pago"));
                p.setNro_cuota(rs.getInt("nro_cuota"));
                p.setMonto_pago(rs.getFloat("monto_pago"));
                return p;
            },
            request.getCod_venta()
        );

        if (pendientes.isEmpty()) {
            throw new RuntimeException("No existe ninguna cuota pendiente para esta venta.");
        }

        PendienteDto cuota = pendientes.get(0);

        // 2. Determinar nombre y teléfono del pagador
        String nombrePagador = request.getNombre_pagador();
        String telfPagador   = request.getNro_telf_pagador();

        boolean faltaNombre = (nombrePagador == null || nombrePagador.isBlank());
        boolean faltaTelf   = (telfPagador == null   || telfPagador.isBlank());

        if (faltaNombre || faltaTelf) {
            // Datos del titular de la venta (cliente)
            String sqlTitular = """
                SELECT 
                    p.nombre_persona,
                    c.valor_contacto AS telefono
                FROM venta v
                JOIN cliente cte ON cte.cod_cliente = v.cod_cliente
                JOIN persona p ON p.cod_persona = cte.cod_persona
                LEFT JOIN contacto_persona cp 
                    ON cp.cod_persona = p.cod_persona
                    AND cp.principal_contacto = 2
                LEFT JOIN contacto c 
                    ON c.cod_contacto = cp.cod_contacto
                    AND c.cod_tipo_contacto = 2   -- 2 = teléfono, 1 = correo
                WHERE v.cod_venta = ?
                """;

            TitularDto titular = jdbcTemplate.queryForObject(
                sqlTitular,
                (rs, rowNum) -> {
                    TitularDto t = new TitularDto();
                    t.setNombre(rs.getString("nombre_persona"));
                    t.setTelefono(rs.getString("telefono")); // puede ser null si no tiene
                    return t;
                },
                request.getCod_venta()
            );

            if (faltaNombre) {
                nombrePagador = titular.getNombre();
            }
            if (faltaTelf && titular.getTelefono() != null && !titular.getTelefono().isBlank()) {
                telfPagador = titular.getTelefono();
            }
        }

        // 3. Actualizar cuota como pagada
        String sqlPagar = """
            UPDATE pago
            SET fecha_pago = now(),
                cod_metodo_pago = ?,
                cod_caja = ?,
                cod_comprobante = ?,
                nombre_pagador = ?,
                nro_telf_pagador = ?,
                cod_estado_pago = 2   -- pagado
            WHERE cod_pago = ?
            """;

        jdbcTemplate.update(
            sqlPagar,
            request.getCod_metodo_pago(),
            request.getCod_caja(),
            request.getCod_comprobante(),
            nombrePagador,
            telfPagador,
            cuota.getCod_pago()
        );

        // 4. Respuesta
        PagoResponseDto response = new PagoResponseDto();
        response.setCod_pago(cuota.getCod_pago());
        response.setNro_cuota(cuota.getNro_cuota());
        response.setMonto_pagado(cuota.getMonto_pago());
        response.setFecha_pago(LocalDateTime.now().toString());
        response.setMensaje("Pago registrado correctamente.");

        return response;
    }

    @Data
    private static class PendienteDto {
        private Integer cod_pago;
        private Integer nro_cuota;
        private Float monto_pago;
    }

    @Data
    private static class TitularDto {
        private String nombre;
        private String telefono;
    }
	
    @Transactional
    public DevolucionResponseDto registrarDevolucion(DevolucionRequestDto request) {

    	String sqlExisteVenta = "SELECT COUNT(*) FROM venta WHERE cod_venta = ?";
    	Integer existe = jdbcTemplate.queryForObject(sqlExisteVenta, Integer.class, request.getCod_venta());
    	if (existe == 0) {
    	    throw new RuntimeException("La venta " + request.getCod_venta() + " no existe.");
    	}

        // 1. Insertar reclamo y obtener cod_reclamo
	    	String sqlInsertReclamo = """
	    		    INSERT INTO reclamo (cod_venta, cod_cliente)
	    		    SELECT v.cod_venta, v.cod_cliente
	    		    FROM venta v
	    		    WHERE v.cod_venta = ?
	    		    RETURNING cod_reclamo
	    		    """;

    		Integer codReclamo = jdbcTemplate.queryForObject(
    		        sqlInsertReclamo,
    		        Integer.class,
    		        request.getCod_venta()
    		);

    		String sqlCliente = "SELECT cod_cliente FROM venta WHERE cod_venta = ?";
    		Integer codCliente = jdbcTemplate.queryForObject(
    		        sqlCliente,
    		        Integer.class,
    		        request.getCod_venta()
    		);

    		
        // 2. Determinar monto de devolución
        Float montoDevolucion = request.getMonto_devolucion();

        if (montoDevolucion == null) {
            String sqlMonto = "SELECT monto_devol(?, ?)";
            // Ajusta la firma si tu función recibe otros parámetros
            montoDevolucion = jdbcTemplate.queryForObject(
                    sqlMonto,
                    Float.class,
                    request.getCod_venta(),
                    request.getCod_producto_devuelto()
            );
        }

        // 3. Insertar en DEVOLUCION y obtener cod_devolucion
        String sqlInsertDevolucion = """
            INSERT INTO devolucion (
                cod_reclamo,
                fecha_hora_devolucion,
                monto_devolucion,
                cod_motivo_devolucion,
                cod_caja,
                producto_devuelto,
                descp_devolucion
            )
            VALUES (?, now(), ?, ?, ?, ?, ?)
            RETURNING cod_devolucion
            """;

        Integer codDevolucion = jdbcTemplate.queryForObject(
                sqlInsertDevolucion,
                Integer.class,
                codReclamo,
                montoDevolucion,
                request.getCod_motivo_devolucion(),
                request.getCod_caja(),
                request.getCod_producto_devuelto(),
                request.getDescp_devolucion()
        );

        // 4. Actualizar estado del producto en producto_venta
        //    (asumo que cod_estado_prodv = 3 significa "devuelto")
        String sqlUpdateProductoVenta = """
            UPDATE producto_venta
            SET cod_estado_prodv = 3
            WHERE cod_venta = ?
              AND cod_producto = ?
            """;

        jdbcTemplate.update(
                sqlUpdateProductoVenta,
                request.getCod_venta(),
                request.getCod_producto_devuelto()
        );

        // 5. Armar respuesta
        DevolucionResponseDto resp = new DevolucionResponseDto();
        resp.setCod_reclamo(codReclamo);
        resp.setCod_devolucion(codDevolucion);
        resp.setCod_venta(request.getCod_venta());
        resp.setCod_cliente(codCliente);
        resp.setMonto_devolucion(montoDevolucion);
        resp.setMensaje("Reclamo por devolución registrado correctamente.");

        return resp;
    }
    
    @Transactional
    public CambioProductoResponseDto registrarCambioProducto(CambioProductoRequestDto request) {

        // 1. Insertar reclamo (cod_cliente se obtiene desde la venta)
        String sqlInsertReclamo = """
            INSERT INTO reclamo (cod_venta, cod_cliente)
            SELECT v.cod_venta, v.cod_cliente
            FROM venta v
            WHERE v.cod_venta = ?
            RETURNING cod_reclamo;
            """;

        Integer codReclamo = jdbcTemplate.queryForObject(
                sqlInsertReclamo,
                Integer.class,
                request.getCod_venta()
        );

        // 2. Obtener cod_cliente para responder
        String sqlCliente = "SELECT cod_cliente FROM venta WHERE cod_venta = ?";
        Integer codCliente = jdbcTemplate.queryForObject(
                sqlCliente,
                Integer.class,
                request.getCod_venta()
        );

        // 3. Validar que el producto que retorna pertenece a esa venta
        String sqlExisteProducto = """
            SELECT COUNT(*) 
            FROM producto_venta 
            WHERE cod_venta = ? 
              AND cod_producto = ?
            """;

        Integer existe = jdbcTemplate.queryForObject(
                sqlExisteProducto,
                Integer.class,
                request.getCod_venta(),
                request.getCod_producto_retorna()
        );

        if (existe == null || existe == 0) {
            throw new RuntimeException(
                "El producto " + request.getCod_producto_retorna() +
                " no pertenece a la venta " + request.getCod_venta()
            );
        }

        // 4. Determinar diferencia_cambio
        Float diferencia = request.getDiferencia_cambio();
        if (diferencia == null) {
            // Asumo firma: dif_cambio(prod_retorna, prod_entrega)
            String sqlDif = "SELECT dif_cambio(?, ?)";
            diferencia = jdbcTemplate.queryForObject(
                    sqlDif,
                    Float.class,
                    request.getCod_producto_retorna(),
                    request.getCod_producto_entrega()
            );
        }

        // 5. Insertar en cambio_producto
        String sqlInsertCambio = """
            INSERT INTO cambio_producto (
                cod_reclamo,
                fecha_hora_cp,
                producto_retorna,
                producto_entrega,
                diferencia_cambio,
                cod_motivo_cambio_prod,
                cod_caja,
                descp_cambio
            )
            VALUES (?, now(), ?, ?, ?, ?, ?, ?)
            RETURNING cod_cambio_prod
            """;

        Integer codCambioProd = jdbcTemplate.queryForObject(
                sqlInsertCambio,
                Integer.class,
                codReclamo,
                request.getCod_producto_retorna(),
                request.getCod_producto_entrega(),
                diferencia,
                request.getCod_motivo_cambio_prod(),
                request.getCod_caja(),
                request.getDescp_cambio()
        );

        // 6. Actualizar estado del producto retornado en producto_venta
        String sqlUpdateProductoVenta = """
            UPDATE producto_venta
            SET cod_estado_prodv = 4   -- 4 = cambiado/retornado (según tu catálogo)
            WHERE cod_venta = ?
              AND cod_producto = ?
            """;

        jdbcTemplate.update(
                sqlUpdateProductoVenta,
                request.getCod_venta(),
                request.getCod_producto_retorna()
        );

        // 7. Armar respuesta
        CambioProductoResponseDto resp = new CambioProductoResponseDto();
        resp.setCod_reclamo(codReclamo);
        resp.setCod_cambio_prod(codCambioProd);
        resp.setCod_venta(request.getCod_venta());
        resp.setCod_cliente(codCliente);
        resp.setProducto_retorna(request.getCod_producto_retorna());
        resp.setProducto_entrega(request.getCod_producto_entrega());
        resp.setDiferencia_cambio(diferencia);
        resp.setMensaje("Reclamo por cambio de producto registrado correctamente.");

        return resp;
    }
    
    @Transactional
    public AnulacionResponseDto registrarAnulacion(AnulacionRequestDto request) {

        // 0. Obtener cod_cliente a partir de la venta
        String sqlCliente = """
            SELECT cod_cliente
            FROM venta
            WHERE cod_venta = ?
            """;

        Integer codCliente = jdbcTemplate.queryForObject(
                sqlCliente,
                Integer.class,
                request.getCod_venta()
        );

        if (codCliente == null) {
            throw new RuntimeException("La venta " + request.getCod_venta() + " no existe.");
        }

        // 1. Insertar reclamo
        String sqlInsertReclamo = """
            INSERT INTO reclamo (cod_venta, cod_cliente)
            VALUES (?, ?)
            RETURNING cod_reclamo
            """;

        Integer codReclamo = jdbcTemplate.queryForObject(
                sqlInsertReclamo,
                Integer.class,
                request.getCod_venta(),
                codCliente
        );

        // 2. Insertar anulación
        String sqlInsertAnulacion = """
            INSERT INTO anulacion (
                cod_reclamo,
                fecha_hora_anulacion,
                cod_motivo_anulacion,
                descp_anulacion
            )
            VALUES (?, now(), ?, ?)
            RETURNING cod_anulacion
            """;

        Integer codAnulacion = jdbcTemplate.queryForObject(
                sqlInsertAnulacion,
                Integer.class,
                codReclamo,
                request.getCod_motivo_anulacion(),
                request.getDescp_anulacion()
        );

        // 3. Marcar la venta como anulada (3, igual que en tu SQL de ejemplo)
        String sqlUpdateVenta = """
            UPDATE venta
            SET cod_estado_venta = 3
            WHERE cod_venta = ?
            """;

        jdbcTemplate.update(sqlUpdateVenta, request.getCod_venta());

        // 4. Anular todos los pagos de esa venta
        //    (buscamos el cod_estado_pago para 'anulado')
        String sqlEstadoAnulado = """
            SELECT cod_estado_pago
            FROM estado_pago
            WHERE lower(nombre_estado_pago) = 'anulado'
            LIMIT 1
            """;

        Integer codEstadoAnulado = jdbcTemplate.queryForObject(
                sqlEstadoAnulado,
                Integer.class
        );

        String sqlAnularPagos = """
            UPDATE pago
            SET cod_estado_pago = ?
            WHERE cod_venta = ?
            """;

        jdbcTemplate.update(
                sqlAnularPagos,
                codEstadoAnulado,
                request.getCod_venta()
        );

        // 5. Armar respuesta
        AnulacionResponseDto resp = new AnulacionResponseDto();
        resp.setCod_reclamo(codReclamo);
        resp.setCod_anulacion(codAnulacion);
        resp.setCod_venta(request.getCod_venta());
        resp.setCod_cliente(codCliente);
        resp.setMensaje("Venta anulada y pagos asociados marcados como anulados.");

        return resp;
    }
}
