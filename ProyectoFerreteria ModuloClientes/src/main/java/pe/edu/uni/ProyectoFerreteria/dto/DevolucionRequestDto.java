package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class DevolucionRequestDto {

    private Integer cod_venta;
    private Integer cod_cliente;

    private Integer cod_caja;
    private Integer cod_motivo_devolucion;
    private Integer cod_producto_devuelto;  // producto_devuelto

    private Float monto_devolucion;         // opcional, si es null se calcula con monto_devol()
    private String descp_devolucion;        // texto libre
}

