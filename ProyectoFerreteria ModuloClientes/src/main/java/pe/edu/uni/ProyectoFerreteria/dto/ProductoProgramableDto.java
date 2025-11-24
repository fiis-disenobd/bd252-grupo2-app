package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class ProductoProgramableDto {
    private Integer cod_producto;
    private String nombre_producto;
    private String unidad_medida;
    private Integer cantidad_pendiente;
    private String tipo_destino;
}
