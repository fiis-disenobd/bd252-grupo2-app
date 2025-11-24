package pe.edu.uni.ProyectoFerreteria.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pe.edu.uni.ProyectoFerreteria.dto.CatalogoPremioDto;
import pe.edu.uni.ProyectoFerreteria.service.ClientesService; // <--- CAMBIO: Usar el servicio consolidado

import java.util.List;

@RestController
@RequestMapping("/api/premios")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PremioController {

    private final ClientesService clientesService; // <--- CAMBIO: Inyección del servicio consolidado

    // Endpoint: GET /api/premios/catalogo
    // Opcional: GET /api/premios/catalogo?buscar=taladro
    @GetMapping("/catalogo")
    public ResponseEntity<List<CatalogoPremioDto>> listarCatalogo(@RequestParam(required = false) String buscar) {
        // CAMBIO: Llamada al método consolidado en ClientesService
        return ResponseEntity.ok(clientesService.obtenerCatalogoPremios(buscar));
    }
}