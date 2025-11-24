package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class PedidoAbastecimientoDto {
	private Integer cod_pedido;
    private String fecha_pedido;
    private String hora_pedido;
    private String estado_pedido;
}
