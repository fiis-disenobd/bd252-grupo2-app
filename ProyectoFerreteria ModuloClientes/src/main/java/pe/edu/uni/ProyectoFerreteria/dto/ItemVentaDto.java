package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class ItemVentaDto {
    private Integer cod_producto;
    private Integer cantidad;
    private Float descuento_unitario;
    private Integer cod_estado_prodv;
    private String direccion_entrega;
    private String fecha_entrega;
}

