package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class ItemSeleccionadoDto {
    private Integer cod_pedido;
    private Integer cod_producto;
    private Integer cantidad;
}