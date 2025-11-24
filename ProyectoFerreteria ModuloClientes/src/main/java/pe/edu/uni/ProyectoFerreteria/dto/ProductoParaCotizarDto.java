package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class ProductoParaCotizarDto {
    private Integer cod_producto;
    private String nombre_producto;
    private Integer cantidad_solicitada;
    private String unidad_medida;
}
