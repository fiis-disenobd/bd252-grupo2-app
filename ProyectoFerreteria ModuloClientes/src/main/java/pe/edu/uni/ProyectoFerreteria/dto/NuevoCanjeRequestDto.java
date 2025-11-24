package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;
import java.util.List;

@Data
public class NuevoCanjeRequestDto {
    // CAMBIO 1: Usamos 'codMaestro' porque la tabla CANJE pide el ID de Maestro, no de Persona.
    private Integer codMaestro; 
    
    // CAMBIO 2: Simplificamos el nombre a 'codUsuario' para coincidir con la entidad.
    private Integer codUsuario; 
    
    // CAMBIO 3: ¡IMPORTANTE! Faltaba el monto. 
    // La tabla CANJE tiene una columna MONTO_CANJE que no puede ser nula.
    private Double montoTotal;  

    private List<DetalleItemDto> items;
    
    @Data
    public static class DetalleItemDto {
        private Integer codPremio;
        private Integer cantidad;
    }
}