package pe.edu.uni.ProyectoFerreteria.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.uni.ProyectoFerreteria.dto.CatalogoPremioDto;
import pe.edu.uni.ProyectoFerreteria.dto.GraficoCanjeDto;
import pe.edu.uni.ProyectoFerreteria.dto.HistorialCanjeDto;
import pe.edu.uni.ProyectoFerreteria.dto.InfoPantallaCanjeDto;
import pe.edu.uni.ProyectoFerreteria.dto.MaestroCompletoDto;
import pe.edu.uni.ProyectoFerreteria.dto.NuevoCanjeRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.PerfilMaestroDto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ClientesService {

    private final JdbcTemplate jdbcTemplate;
    
    // =======================================================
    // FUNCIÓN DE AYUDA: MANEJO DE EXCEPCIONES PARA queryForObject
    // =======================================================
    
    /**
     * Ejecuta queryForObject de manera segura, devolviendo null si no se encuentra el resultado.
     */
    private <T> T safeQueryForObject(String sql, Class<T> requiredType, Object... args) {
        try {
            // Usamos queryForMap si el tipo requerido es Map.class, sino queryForObject
            if (requiredType == Map.class) {
                 List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, args);
                 return (T) (results.isEmpty() ? null : results.get(0));
            }
            return jdbcTemplate.queryForObject(sql, requiredType, args);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }


    // =======================================================
    // I. FUNCIONES DE MAESTRO (Listado y Perfil)
    // =======================================================

    /**
     * R-701: Lista el resumen de todos los maestros.
     */
    public List<MaestroCompletoDto> listarMaestrosCompletos() {
        String sql = """
            SELECT 
                COD_PERSONA AS codPersona,
                cod_maestro AS codMaestro,
                Nombre AS nombre,
                RUC AS ruc,
                Distrito AS distrito,
                Telefono AS telefono,
                Correo AS correo,
                Especialidad AS especialidad,
                Fecha_Registro AS fechaRegistro
            FROM "FERRETERIA".VISTA_MAESTROS_COMPLETA
            ORDER BY codPersona
        """;
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(MaestroCompletoDto.class));
    }
    
    /**
     * R-702: Obtiene el perfil completo de un maestro.
     */
    public PerfilMaestroDto obtenerPerfilCompleto(Integer codPersona) {
        
        // 1. Obtener Datos Básicos (Obligatorios para determinar si el maestro existe)
        String sqlDatos = """
            SELECT 
                p.nombre_persona as nombre, 
                CAST(m.fecha_registro_maestro AS VARCHAR) as fecha 
            FROM "FERRETERIA".persona p 
            JOIN "FERRETERIA".maestro m ON p.cod_persona = m.cod_persona 
            WHERE p.cod_persona = ?
        """;
        
        // Usamos safeQueryForObject para Map, que devuelve null si no existe.
        Map<String, Object> datosRegistro = safeQueryForObject(sqlDatos, Map.class, codPersona);
        
        String nombre = (datosRegistro != null) ? (String) datosRegistro.getOrDefault("nombre", "Desconocido") : "Desconocido";
        String fecha = (datosRegistro != null) ? (String) datosRegistro.getOrDefault("fecha", "") : "";
        
        if (nombre.equals("Desconocido")) {
            return null; 
        }

        // 2. Obtener Datos de Contacto y Dirección (Usando safeQueryForObject para opcionales)
        // RUC
        String sqlRuc = """
            SELECT dp.valor_documento 
            FROM "FERRETERIA".maestro m 
            JOIN "FERRETERIA".persona p ON m.cod_persona = p.cod_persona 
            JOIN "FERRETERIA".documento_persona dp ON p.cod_persona = dp.cod_persona 
            JOIN "FERRETERIA".tipo_documento td ON td.cod_tipo_documento = dp.cod_tipo_documento 
            WHERE p.cod_persona = ? AND td.valor_tipo_documento = 'RUC'
        """;
        String ruc = safeQueryForObject(sqlRuc, String.class, codPersona);

        // Teléfono (TC.VALOR_TIPO_CONTACTO = 'TELEFONO CELULAR')
        String sqlTel = """
            SELECT c.valor_contacto 
            FROM "FERRETERIA".maestro m 
            JOIN "FERRETERIA".persona p ON m.cod_persona = p.cod_persona 
            JOIN "FERRETERIA".contacto_persona cop ON cop.cod_persona = p.cod_persona 
            JOIN "FERRETERIA".contacto c ON c.cod_contacto = cop.cod_contacto 
            JOIN "FERRETERIA".tipo_contacto tc ON c.cod_tipo_contacto = tc.cod_tipo_contacto 
            WHERE p.cod_persona = ? AND tc.valor_tipo_contacto = 'TELEFONO CELULAR' 
            LIMIT 1
        """;
        String telefono = safeQueryForObject(sqlTel, String.class, codPersona);

        // Correo (TC.VALOR_TIPO_CONTACTO = 'CORREO')
        String sqlMail = """
            SELECT c.valor_contacto 
            FROM "FERRETERIA".maestro m 
            JOIN "FERRETERIA".persona p ON m.cod_persona = p.cod_persona 
            JOIN "FERRETERIA".contacto_persona cop ON cop.cod_persona = p.cod_persona 
            JOIN "FERRETERIA".contacto c ON c.cod_contacto = cop.cod_contacto 
            JOIN "FERRETERIA".tipo_contacto tc ON c.cod_tipo_contacto = tc.cod_tipo_contacto 
            WHERE p.cod_persona = ? AND tc.valor_tipo_contacto = 'CORREO' 
            LIMIT 1
        """;
        String correo = safeQueryForObject(sqlMail, String.class, codPersona);

        // Dirección (DP.PRINCIPAL_DIRECCION IS NOT NULL)
        String sqlDir = """
            SELECT D.DISTRITO ||', '|| D.CIUDAD ||', '|| D.VIA ||' '|| D.NUMERO
            FROM "FERRETERIA".persona p 
            JOIN "FERRETERIA".maestro m ON p.cod_persona = m.cod_persona 
            JOIN "FERRETERIA".direccion_persona dp ON dp.cod_persona = p.cod_persona 
            JOIN "FERRETERIA".direccion d ON d.cod_direccion = dp.cod_direccion 
            WHERE p.cod_persona = ? AND dp.principal_direccion IS NOT NULL LIMIT 1
        """;
        String direccion = safeQueryForObject(sqlDir, String.class, codPersona);

        // Especialidad
        String sqlEsp = """
            SELECT e.valor_especialidad 
            FROM "FERRETERIA".maestro m 
            JOIN "FERRETERIA".especialidades e ON e.cod_especialidad = m.cod_especialidad 
            WHERE m.cod_persona = ?
        """;
        String especialidad = safeQueryForObject(sqlEsp, String.class, codPersona);


        // 3. Obtener Estadísticas
        // Referidos (USO DE COMILLAS PARA LA COLUMNA PROBLEMÁTICA)
        String sqlRef = """
                SELECT contar_referidos_por_maestro(m.cod_maestro)
                FROM "FERRETERIA".maestro m
                WHERE m.cod_persona = ?
            """;
        Integer referidos = safeQueryForObject(sqlRef, Integer.class, codPersona);

        // Total Canjes (USO DE COMILLAS PARA LA COLUMNA PROBLEMÁTICA)
        String sqlCanjes = """
                SELECT contar_canjes_por_maestro(m.cod_maestro)
                FROM "FERRETERIA".maestro m
                WHERE m.cod_persona = ?
            """;
        Integer totalCanjes = safeQueryForObject(sqlCanjes, Integer.class, codPersona);

        // Puntos Actuales 
        String sqlPtos = """
            SELECT M.puntos_maestro 
            FROM "FERRETERIA".MAESTRO M 
            JOIN "FERRETERIA".PERSONA P ON M.cod_persona = P.cod_persona 
            WHERE P.cod_persona = ?
        """;
        Double puntosActuales = safeQueryForObject(sqlPtos, Double.class, codPersona);

        
        // 4. Procesar Historial de Canjes (REGISTRO DE CANJES)
        String sqlHist = """
            SELECT 
            CAST(CA.FECHA_HORA_CANJE AS VARCHAR) AS fecha, 
            P.NOMBRE_PREMIO AS premio, 
            DC.CANTIDAD_PREMIO AS cantidad, 
            (DC.CANTIDAD_PREMIO * P.PUNTOS_PREMIO) AS puntosGastados, 
            EC.VALOR_ESTADO_CANJE AS estado 
            FROM "FERRETERIA".MAESTRO M 
            JOIN "FERRETERIA".PERSONA PE ON PE.COD_PERSONA = M.COD_PERSONA 
            JOIN "FERRETERIA".CANJE CA ON M.COD_MAESTRO = CA.COD_MAESTRO
            JOIN "FERRETERIA".DETALLE_CANJE DC ON DC.COD_CANJE = CA.COD_CANJE 
            JOIN "FERRETERIA".PREMIOS P ON DC.COD_PREMIO = P.COD_PREMIO
            JOIN "FERRETERIA".ESTADO_CANJE EC ON EC.COD_ESTADO_CANJE = CA.COD_ESTADO_CANJE 
            WHERE PE.COD_PERSONA = ?
            ORDER BY CA.FECHA_HORA_CANJE DESC
        """;
        
        List<HistorialCanjeDto> historial = jdbcTemplate.query(sqlHist, new BeanPropertyRowMapper<>(HistorialCanjeDto.class), codPersona);

        Double puntosGastados = historial.stream()
            .mapToDouble(HistorialCanjeDto::getPuntosGastados)
            .sum();

        // 5. Obtener Gráfico (DATOS DE CANJES POR MES)
        String sqlGraf = """
            SELECT
                EXTRACT(YEAR FROM CA.FECHA_HORA_CANJE) || '-' || EXTRACT(MONTH FROM CA.FECHA_HORA_CANJE) AS mes,
                COUNT(*) AS cantidad 
            FROM "FERRETERIA".MAESTRO M
            JOIN "FERRETERIA".PERSONA P ON M.COD_PERSONA = P.COD_PERSONA
            JOIN "FERRETERIA".CANJE CA ON M.COD_MAESTRO = CA.COD_MAESTRO 
            WHERE P.COD_PERSONA = ?
            GROUP BY
                EXTRACT(YEAR FROM CA.FECHA_HORA_CANJE),
                EXTRACT(MONTH FROM CA.FECHA_HORA_CANJE)
            ORDER BY mes
        """;
        List<GraficoCanjeDto> grafico = jdbcTemplate.query(sqlGraf, new BeanPropertyRowMapper<>(GraficoCanjeDto.class), codPersona);

        // 6. Construir y retornar el DTO
        return PerfilMaestroDto.builder()
                .nombre(nombre)
                .ruc(ruc)
                .telefono(telefono)
                .correo(correo)
                .direccion(direccion)
                .especialidad(especialidad)
                .fechaRegistro(fecha)
                .comprasTotales(totalCanjes != null ? totalCanjes : 0)
                .puntosGastados(puntosGastados)
                .referidos(referidos != null ? referidos : 0)
                .puntosActuales(puntosActuales != null ? puntosActuales : 0.0)
                .graficoCanjes(grafico)
                .historialCanjes(historial)
                .build();
    }

    // =======================================================
    // II. FUNCIONES DE CANJE
    // =======================================================
    
    /**
     * R-703: Prepara la información inicial para la pantalla de registro de canje.
     */
    public InfoPantallaCanjeDto obtenerDatosPantallaCanje(Integer codUsuario, Integer codPersonaMaestro) {
        
        // 1. Obtener Operador
        String sqlOp = """
            SELECT 
            p.nombre_persona as nombre, 
            a.valor_area as area, 
            r.valor_rol as rol 
            FROM "FERRETERIA".usuario u 
            JOIN "FERRETERIA".area a ON u.cod_area = a.cod_area 
            JOIN "FERRETERIA".rol r ON r.cod_rol = u.cod_rol 
            JOIN "FERRETERIA".persona p ON p.cod_persona = u.cod_persona 
            WHERE u.cod_usuario = ?
        """;
        Map<String, Object> dataOp = safeQueryForObject(sqlOp, Map.class, codUsuario);
        
        String opNombre = (String) dataOp.getOrDefault("nombre", "No encontrado");
        String opArea = (String) dataOp.getOrDefault("area", "-");
        String opRol = (String) dataOp.getOrDefault("rol", "-");

        // 2. Obtener Maestro
        String sqlMaes = """
            SELECT
            m.puntos_maestro as puntos, 
            p.nombre_persona as nombre 
            FROM "FERRETERIA".maestro m 
            JOIN "FERRETERIA".persona p ON m.cod_persona = p.cod_persona 
            WHERE p.cod_persona = ?
        """;
        Map<String, Object> dataMaestro = safeQueryForObject(sqlMaes, Map.class, codPersonaMaestro);
        
        String maestroNombre = (String) dataMaestro.getOrDefault("nombre", "No encontrado");
        Double puntos = ((Number) dataMaestro.getOrDefault("puntos", 0.0)).doubleValue();
        
        // 3. Armar DTO
        return InfoPantallaCanjeDto.builder()
                .nombreOperador(opNombre)
                .areaOperador(opArea)
                .rolOperador(opRol)
                .nombreMaestro(maestroNombre)
                .puntosDisponibles(puntos)
                .fechaServidor(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                .build();
    }
    
    /**
     * R-704: Registra un nuevo canje y descuenta los puntos al maestro.
     */
    @Transactional
    public Integer registrarCanje(NuevoCanjeRequestDto request) {

        // 0. Validar saldo del Maestro y obtener puntos
        String sqlPuntosMaestro = "SELECT puntos_maestro FROM \"FERRETERIA\".maestro WHERE cod_maestro = ?";
        Double puntosActuales = safeQueryForObject(sqlPuntosMaestro, Double.class, request.getCodMaestro());

        if (puntosActuales == null) {
             throw new RuntimeException("El maestro con código " + request.getCodMaestro() + " no existe.");
        }
        
        if (puntosActuales < request.getMontoTotal()) {
            throw new RuntimeException("Saldo insuficiente. El maestro tiene " + 
                                       puntosActuales + " puntos y el canje cuesta " + request.getMontoTotal());
        }

        // 1. Crear y Guardar el objeto CANJE
        String sqlInsertCanje = """
            INSERT INTO "FERRETERIA".canje (
                cod_maestro, 
                cod_usuario, 
                monto_canje, 
                cod_estado_canje,
                fecha_hora_canje
            ) 
            VALUES (?, ?, ?, 1, now()) 
            RETURNING cod_canje
        """;
        
        Integer idGenerado = jdbcTemplate.queryForObject(sqlInsertCanje, Integer.class,
            request.getCodMaestro(), 
            request.getCodUsuario(), 
            request.getMontoTotal()
        );

        // 2. Guardar los DETALLES
        String sqlInsertDetalle = """
            INSERT INTO "FERRETERIA".detalle_canje (
                cod_canje, 
                cod_premio, 
                cantidad_premio
            )
            VALUES (?, ?, ?)
        """;

        for (NuevoCanjeRequestDto.DetalleItemDto item : request.getItems()) {
            jdbcTemplate.update(sqlInsertDetalle,
                idGenerado,
                item.getCodPremio(),
                item.getCantidad()
            );
        }

        // 3. RESTAR PUNTOS AL MAESTRO Y ACTUALIZAR
        Double nuevosPuntos = puntosActuales - request.getMontoTotal();
        
        String sqlUpdateMaestro = """
            UPDATE "FERRETERIA".maestro
            SET puntos_maestro = ?, ultima_actividad_maestro = now()
            WHERE cod_maestro = ?
        """;
        
        jdbcTemplate.update(sqlUpdateMaestro, nuevosPuntos, request.getCodMaestro());

        return idGenerado;
    }


    // =======================================================
    // III. FUNCIONES DE PREMIO (Catálogo)
    // =======================================================

    /**
     * R-705: Obtener todo el catálogo o filtrar por nombre de premio.
     */
    public List<CatalogoPremioDto> obtenerCatalogoPremios(String busqueda) {
        
        String sql = """
            SELECT 
                cod_premio AS id,
                nombre,
                descripcion,
                costo AS costo,
                categorias AS categoria,
                disponibilidad_premio AS stock
            FROM "FERRETERIA".vista_catalogo_premios
        """;

        // Filtro si hay búsqueda
        if (busqueda != null && !busqueda.isEmpty()) {
            sql += " WHERE LOWER(nombre) LIKE LOWER('%" + busqueda + "%')";
        }
        
        sql += " ORDER BY nombre ASC";

        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(CatalogoPremioDto.class));
    }
}