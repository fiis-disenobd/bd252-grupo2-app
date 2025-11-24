package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class ItemPendienteCotizacionDto {
    private String nombre_producto;
    private Integer cod_pedido;
    private Integer cantidad_requerida;
    private String unidad_medida;
    private String fecha_requerida;
    private Integer cod_producto;
}
