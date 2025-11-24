package pe.edu.uni.ProyectoFerreteria.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pe.edu.uni.ProyectoFerreteria.dto.InfoPantallaCanjeDto;
import pe.edu.uni.ProyectoFerreteria.dto.NuevoCanjeRequestDto;
import pe.edu.uni.ProyectoFerreteria.service.ClientesService; // <--- CAMBIO: Usar el servicio consolidado

@RestController
@RequestMapping("/api/canjes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CanjeController {

    private final ClientesService clientesService; // <--- CAMBIO: Inyección del servicio consolidado

    // Endpoint para cargar la pantalla inicial
    // Ejemplo: GET /api/canjes/info?codUsuario=1&codMaestro=5
    // NOTA: En el servicio consolidado el parámetro se llama codPersonaMaestro
    @GetMapping("/info")
    public ResponseEntity<InfoPantallaCanjeDto> obtenerInfoPantalla(
            @RequestParam Integer codUsuario,
            @RequestParam Integer codMaestro) { // codMaestro es en realidad codPersona
        
        // CAMBIO: Llamada al método consolidado en ClientesService
        return ResponseEntity.ok(clientesService.obtenerDatosPantallaCanje(codUsuario, codMaestro));
    }
    
    @PostMapping("/registrar")
    public ResponseEntity<String> registrarCanje(@RequestBody NuevoCanjeRequestDto request) {
        try {
            // CAMBIO: Llamada al método consolidado en ClientesService
            Integer idCanje = clientesService.registrarCanje(request); 
            return ResponseEntity.ok("Canje registrado con éxito. Código: C-" + idCanje);
        } catch (RuntimeException e) { // Capturamos las excepciones de negocio (ej. saldo insuficiente)
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error al procesar el canje: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); 
            return ResponseEntity.internalServerError().body("Error al procesar el canje: " + e.getMessage());
        }
    }
}