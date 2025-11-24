package pe.edu.uni.ProyectoFerreteria.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pe.edu.uni.ProyectoFerreteria.dto.AnulacionDto;
import pe.edu.uni.ProyectoFerreteria.dto.AnulacionRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.AnulacionResponseDto;
import pe.edu.uni.ProyectoFerreteria.dto.CambioProdDto;
import pe.edu.uni.ProyectoFerreteria.dto.CambioProductoRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.CambioProductoResponseDto;
import pe.edu.uni.ProyectoFerreteria.dto.CronogramaPagoDto;
import pe.edu.uni.ProyectoFerreteria.dto.DetalleVentaDto;
import pe.edu.uni.ProyectoFerreteria.dto.DevolucionDto;
import pe.edu.uni.ProyectoFerreteria.dto.DevolucionRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.DevolucionResponseDto;
import pe.edu.uni.ProyectoFerreteria.dto.ListadoVentasDto;
import pe.edu.uni.ProyectoFerreteria.dto.PagoPendienteDto;
import pe.edu.uni.ProyectoFerreteria.dto.PagoRealizadoDto;
import pe.edu.uni.ProyectoFerreteria.dto.PagoRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.PagoResponseDto;
import pe.edu.uni.ProyectoFerreteria.dto.VentaRequestDto;
import pe.edu.uni.ProyectoFerreteria.dto.VentaResponseDto;
import pe.edu.uni.ProyectoFerreteria.service.ConsultasVentasService;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")

public class VentasController {

	@Autowired
    private ConsultasVentasService consultasService;
	
	@GetMapping("/principal")
    public ResponseEntity<List<ListadoVentasDto>> listarVentas() {
        try {
            
            List<ListadoVentasDto> lista = consultasService.listadoVentas();
            
            if (lista.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(lista);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
	
	
	@GetMapping("/detalle/{id}")
	public ResponseEntity<DetalleVentaDto> detalleVenta(@PathVariable Integer id) {
	    try {
	    		DetalleVentaDto venta = consultasService.detalleVentas(id);

	        if (venta == null) {
	            return ResponseEntity.notFound().build();
	        }
	        return ResponseEntity.ok(venta);

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.internalServerError().build();
	    }
	}

	@GetMapping("/pagos/realizados")
    public ResponseEntity<List<PagoRealizadoDto>> pagosRealizados() {
        try {
            
            List<PagoRealizadoDto> lista = consultasService.verPagosRealizados();
            
            if (lista.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(lista);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
	
	@GetMapping("/pagos/pendientes")
    public ResponseEntity<List<PagoPendienteDto>> pagosPendientes() {
        try {
            
            List<PagoPendienteDto> lista = consultasService.verPagosPendientes();
            
            if (lista.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(lista);
 
           } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
	
	@GetMapping("/reclamos/devoluciones")
    public ResponseEntity<List<DevolucionDto>> verDevoluciones() {
        try {
            
            List<DevolucionDto> lista = consultasService.verDevoluciones();
            
            if (lista.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(lista);
 
           } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
	
	@GetMapping("/reclamos/cambio-producto")
    public ResponseEntity<List<CambioProdDto>> verCambiosProducto() {
        try {
            
            List<CambioProdDto> lista = consultasService.verCambiosProd();
            
            if (lista.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(lista);
 
           } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
	
	@GetMapping("/reclamos/anulaciones")
    public ResponseEntity<List<AnulacionDto>> verAnulaciones() {
        try {
            
            List<AnulacionDto> lista = consultasService.verAnulaciones();
            
            if (lista.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(lista);
 
           } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
	
	@GetMapping("/pagos/cronograma/{id}")
	public ResponseEntity<CronogramaPagoDto> verCronograma(@PathVariable Integer id) {
	    try {
	    		CronogramaPagoDto venta = consultasService.verCronogramaPago(id);

	        if (venta == null) {
	            return ResponseEntity.notFound().build();
	        }
	        return ResponseEntity.ok(venta);

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.internalServerError().build();
	    }
	}
	
	@PostMapping("/registrar")
    public ResponseEntity<VentaResponseDto> registrarVenta(@RequestBody VentaRequestDto request) {
        try {
            VentaResponseDto respuesta = consultasService.registrarVenta(request);
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
	


    @PostMapping("/pagos/registrar")
    public ResponseEntity<PagoResponseDto> registrarPago(@RequestBody PagoRequestDto request) {
        try {
            PagoResponseDto r = consultasService.registrarPago(request);
            return ResponseEntity.ok(r);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/devolucion/registrar")
    public ResponseEntity<DevolucionResponseDto> registrarDevolucion(
            @RequestBody DevolucionRequestDto request) {
        try {
            DevolucionResponseDto resp = consultasService.registrarDevolucion(request);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    
    }

    @PostMapping("/cambio-producto/registrar")
    public ResponseEntity<CambioProductoResponseDto> registrarCambioProducto(
            @RequestBody CambioProductoRequestDto request) {
        try {
            CambioProductoResponseDto resp = consultasService.registrarCambioProducto(request);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/anulacion/registrar")
    public ResponseEntity<AnulacionResponseDto> registrarAnulacion(
            @RequestBody AnulacionRequestDto request) {
        try {
            AnulacionResponseDto resp = consultasService.registrarAnulacion(request);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
