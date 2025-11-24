package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;
import java.util.List;

@Data
public class PedidoDetalleDto {
    // Cabecera
    private Integer cod_pedido;
    private String fecha_pedido;
    private String hora_pedido;
    private String estado_pedido;
    private String valor_area;

    // Tabla de productos
    private List<PedidoDetalleItemDto> productos;
}
