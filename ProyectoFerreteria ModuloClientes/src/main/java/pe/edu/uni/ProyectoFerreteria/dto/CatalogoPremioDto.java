package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor; // Recommended for clarity when using @Builder

@Data
@Builder
@NoArgsConstructor // <--- AÑADIR: Permite a Spring crear una instancia
@AllArgsConstructor
public class CatalogoPremioDto {
    private Integer id;
    private String nombre;
    private String descripcion;
    private Double costo;
    private String categoria;
    private Integer stock;
}