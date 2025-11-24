package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProgramarRecepcionRequestDto {
    private Integer cod_orden;
    
    // Sección A & C
    private String modalidad_logistica; // 'Entrega en Almacén' o 'Recojo por Transporte Propio'
    private String fecha_programada;    // YYYY-MM-DD
    private String hora_programada;     // HH:mm
    
    // Opcional: Solo si es Almacén
    private String cod_instalacion;     // ID del Almacén (puede ser null si es Transporte)
    
    // Sección D: Items
    private List<ItemProgramacionDto> items;
}
