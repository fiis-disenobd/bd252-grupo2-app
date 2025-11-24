package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class PedidoDetalleItemDto {
    private String nombre_producto;
    private Integer cantidad_requerida;
    private String unidad_medida;
    private String fecha_requerida;
    private String tipo_destino;
    private String direccion_destino_externo;
}
