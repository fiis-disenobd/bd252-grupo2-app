package pe.edu.uni.ProyectoFerreteria.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pe.edu.uni.ProyectoFerreteria.dto.DetalleOfertaDto;
import pe.edu.uni.ProyectoFerreteria.dto.GenerarOrdenCompraRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.GenerarSolicitudRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.ItemPendienteCotizacionDto;
import pe.edu.uni.ProyectoFerreteria.dto.OrdenPendienteRecepcionDto;
import pe.edu.uni.ProyectoFerreteria.dto.PedidoAbastecimientoDto;
import pe.edu.uni.ProyectoFerreteria.dto.PedidoDetalleDto;
import pe.edu.uni.ProyectoFerreteria.dto.ProductoCatalogoDto;
import pe.edu.uni.ProyectoFerreteria.dto.ProductoParaCotizarDto;
import pe.edu.uni.ProyectoFerreteria.dto.ProductoProgramableDto;
import pe.edu.uni.ProyectoFerreteria.dto.ProgramarRecepcionRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.ProveedorBusquedaDto;
import pe.edu.uni.ProyectoFerreteria.dto.ProveedorDto;
import pe.edu.uni.ProyectoFerreteria.dto.RegistrarCotizacionRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.SolicitudCotizacionDto;
import pe.edu.uni.ProyectoFerreteria.service.ConsultasAbastecimientoService;

import java.util.List;

@RestController
@RequestMapping("/api/abastecimiento")
@CrossOrigin(origins = "*")
public class AbastecimientoController {

    @Autowired
    private ConsultasAbastecimientoService consultasService;
    
    @GetMapping("/proveedores")
    public ResponseEntity<List<ProveedorDto>> listarTodosProveedores() {
        try {
            
            List<ProveedorDto> lista = consultasService.listarProveedores();
            
            if (lista.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(lista);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/productos")
    public ResponseEntity<List<ProductoCatalogoDto>> listarProductos() {
        try {
            
            List<ProductoCatalogoDto> lista = consultasService.listarCatalogoProductos();
            
            if (lista.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(lista);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==========================================
    // SECCIÓN: PEDIDOS
    // ==========================================
    @GetMapping("/pedidos")
    public ResponseEntity<List<PedidoAbastecimientoDto>> listarPedidos() {
        try {
            
            List<PedidoAbastecimientoDto> lista = consultasService.listarPedidosResumen();
            
            if (lista.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(lista);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/pedidos/{id}/detalle")
    public ResponseEntity<PedidoDetalleDto> verDetallePedido(@PathVariable Integer id) {
        try {
        	PedidoDetalleDto detalle = consultasService.obtenerPedidoCompleto(id);
            
            if (detalle == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(detalle);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/pedidos/{id}/revisar")
    public ResponseEntity<String> marcarComoRevisado(@PathVariable Integer id) {
        try {
            consultasService.actualizarEstadoRevisadoPedido(id);
            return ResponseEntity.ok("El pedido ha sido marcado como Revisado correctamente.");
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al actualizar el estado.");
        }
    }
    
    @GetMapping("/solicitudes")
    public ResponseEntity<List<SolicitudCotizacionDto>> listarSolicitudes() {
        try {
            
            List<SolicitudCotizacionDto> lista = consultasService.listarSolicitudesCotizacionResumen();
            
            if (lista.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(lista);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // ==========================================
    // SECCIÓN: GENERAR SOLICITUD DE COTIZACION
    // ==========================================

    // 1. LISTAR ÍTEMS PENDIENTES
    @GetMapping("/solicitudes/items-pendientes")
    public ResponseEntity<List<ItemPendienteCotizacionDto>> listarItemsPendientes(
            @RequestParam(required = false) String desde,
            @RequestParam(required = false) String hasta) {
        try {
            List<ItemPendienteCotizacionDto> lista = consultasService.listarItemsPendientes(desde, hasta);
            return ResponseEntity.ok(lista); 
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/solicitudes/generar")
    public ResponseEntity<String> generarSolicitud(@RequestBody GenerarSolicitudRequestDto request) {
        try {
            if (request.getItemsSeleccionados() == null || request.getItemsSeleccionados().isEmpty()) {
                return ResponseEntity.badRequest().body("Debe seleccionar al menos un ítem para generar la solicitud.");
            }

            consultasService.generarSolicitudCotizacion(request);
            
            return ResponseEntity.ok("Solicitud de Cotización generada exitosamente.");
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al generar la solicitud: " + e.getMessage());
        }
    }
    
    // =================================================================================
    //              SECCIÓN: REGISTRAR COTIZACIÓN
    // =================================================================================
    
    // 1. BUSCADOR DE PROVEEDORES (Endpoint para el Autocomplete)
    // URL: /api/abastecimiento/proveedores/buscar?termino=aceros
    @GetMapping("/proveedores/buscar")
    public ResponseEntity<List<ProveedorBusquedaDto>> buscarProveedores(@RequestParam String termino) {
        try {
            List<ProveedorBusquedaDto> resultados = consultasService.buscarProveedores(termino);
            return ResponseEntity.ok(resultados);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // 1. OBTENER DATOS PARA LA PANTALLA
    // Sirve para pintar la tabla con los productos que se pidieron en la solicitud X
    @GetMapping("/solicitudes/{id}/productos-para-cotizar")
    public ResponseEntity<List<ProductoParaCotizarDto>> obtenerProductosParaCotizar(@PathVariable Integer id) {
        try {
            List<ProductoParaCotizarDto> lista = consultasService.obtenerProductosDeSolicitud(id);
            if (lista.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // 2. GUARDAR COTIZACIÓN
    @PostMapping("/cotizaciones")
    public ResponseEntity<String> registrarCotizacion(@RequestBody RegistrarCotizacionRequestDto request) {
        try {
            // Validación básica
            if (request.getProductosCotizados() == null || request.getProductosCotizados().isEmpty()) {
                return ResponseEntity.badRequest().body("La cotización debe incluir al menos un producto.");
            }
            
            consultasService.registrarCotizacion(request);
            
            return ResponseEntity.ok("Cotización registrada exitosamente.");
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al registrar cotización: " + e.getMessage());
        }
    }
    
    // =================================================================================
    //              SECCIÓN: ADJUDICACIÓN DE ÍTEMS
    // =================================================================================

    // 1. LISTAR PROVEEDORES QUE COTIZARON
    // URL: /api/abastecimiento/solicitudes/1/proveedores-cotizantes
    @GetMapping("/solicitudes/{id}/proveedores-cotizantes")
    public ResponseEntity<List<ProveedorBusquedaDto>> listarProveedoresConOferta(@PathVariable Integer id) {
        try {
            List<ProveedorBusquedaDto> proveedores = consultasService.listarProveedoresConOferta(id);
            if (proveedores.isEmpty()) return ResponseEntity.noContent().build();
            return ResponseEntity.ok(proveedores);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // 2. LISTAR ITEMS DE UNA OFERTA ESPECÍFICA
    // URL: /api/abastecimiento/solicitudes/3/ofertas/10 (Solicitud 3, Proveedor 10)
    @GetMapping("/solicitudes/{id}/ofertas/{idProveedor}")
    public ResponseEntity<List<DetalleOfertaDto>> verOfertaProveedor(
            @PathVariable Integer id, 
            @PathVariable Integer idProveedor) {
        try {
            List<DetalleOfertaDto> oferta = consultasService.listarDetalleOferta(id, idProveedor);
            return ResponseEntity.ok(oferta);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // 3. GENERAR ÓRDENES DE COMPRA (Botón Final)
    @PostMapping("/ordenes-compra/generar")
    public ResponseEntity<String> generarOrdenesCompra(@RequestBody GenerarOrdenCompraRequestDto request) {
        try {
            if (request.getItems_adjudicados() == null || request.getItems_adjudicados().isEmpty()) {
                return ResponseEntity.badRequest().body("No hay ítems adjudicados para generar órdenes.");
            }

            consultasService.generarOrdenesCompra(request);
            return ResponseEntity.ok("Órdenes de Compra generadas exitosamente.");
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al generar órdenes: " + e.getMessage());
        }
    }
    
    // =================================================================================
    //              SECCIÓN: PROGRAMAR RECEPCION
    // =================================================================================
    
    // 1. LISTAR ÓRDENES PARA PROGRAMAR RECEPCIÓN (GET)
    // URL: /api/abastecimiento/ordenes-compra/pendientes-recepcion
    @GetMapping("/ordenes-compra/pendientes-recepcion")
    public ResponseEntity<List<OrdenPendienteRecepcionDto>> listarOrdenesPendientesRecepcion() {
        try {
            
            List<OrdenPendienteRecepcionDto> lista = consultasService.listarOrdenesPendientesRecepcion();
            
            if (lista.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(lista);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 1. OBTENER PRODUCTOS FILTRADOS (Por Modalidad/Destino)
    // URL: /api/abastecimiento/ordenes-compra/3/productos-programables?modalidad=Entrega en Almacén
    @GetMapping("/ordenes-compra/{id}/productos-programables")
    public ResponseEntity<List<ProductoProgramableDto>> listarProductosParaProgramar(
            @PathVariable Integer id,
            @RequestParam String modalidad) { // modalidad viene del Select del Frontend
        try {
            List<ProductoProgramableDto> lista = consultasService.listarProductosParaProgramar(id, modalidad);
            
            // Si la lista está vacía, significa que para esa modalidad no hay productos pendientes
            // (Ej: Elegiste 'Interno' pero todos los productos de esta OC son 'Externos')
            if (lista.isEmpty()) return ResponseEntity.noContent().build();
            
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // 2. GUARDAR PROGRAMACIÓN
    @PostMapping("/recepciones/programar")
    public ResponseEntity<String> programarRecepcion(@RequestBody ProgramarRecepcionRequestDto request) {
        try {
            if (request.getItems() == null || request.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body("Debe programar al menos un ítem.");
            }

            consultasService.registrarProgramacionRecepcion(request);
            
            return ResponseEntity.ok("Recepción programada exitosamente.");
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al programar: " + e.getMessage());
        }
    }
}