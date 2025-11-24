package pe.edu.uni.ProyectoFerreteria.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.*;

import pe.edu.uni.ProyectoFerreteria.dto.MaestroCompletoDto;
import pe.edu.uni.ProyectoFerreteria.dto.PerfilMaestroDto;
import pe.edu.uni.ProyectoFerreteria.service.ClientesService; // <--- CAMBIO: Usar el servicio consolidado

import java.util.List;

@RestController
@RequestMapping("/api/maestros")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MaestroController {

    private final ClientesService clientesService; // <--- CAMBIO: Inyección del servicio consolidado

    @GetMapping("/resumen")
    public ResponseEntity<List<MaestroCompletoDto>> obtenerResumenMaestros() {
        // CAMBIO: Llamada al método consolidado en ClientesService
        List<MaestroCompletoDto> lista = clientesService.listarMaestrosCompletos(); 
        if (lista.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(lista);
    }
    
    // Endpoint: GET /api/maestros/{codPersona}/perfil
    @GetMapping("/{codPersona}/perfil")
    public ResponseEntity<PerfilMaestroDto> obtenerPerfil(@PathVariable Integer codPersona) {
        // CAMBIO: Llamada al método consolidado en ClientesService
        PerfilMaestroDto perfil = clientesService.obtenerPerfilCompleto(codPersona);
        return ResponseEntity.ok(perfil);
    }
    
}