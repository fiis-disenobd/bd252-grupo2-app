package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InfoPantallaCanjeDto {
    // Datos Operador
    private String nombreOperador;
    private String areaOperador;
    private String rolOperador;
    
    // Datos Maestro
    private String nombreMaestro;
    private Double puntosDisponibles;
    
    // Fecha actual (opcional, el front suele manejarlo, pero lo mandamos por si acaso)
    private String fechaServidor;
}