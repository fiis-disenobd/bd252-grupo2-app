package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaestroCompletoDto {
    // --- AGREGADO ---
    private Integer codMaestro; 
    // ----------------
    
    private Integer codPersona;
    private String nombre;
    private String ruc;
    private String distrito;
    private String telefono;
    private String correo;
    private String especialidad;
    private String fechaRegistro;
}