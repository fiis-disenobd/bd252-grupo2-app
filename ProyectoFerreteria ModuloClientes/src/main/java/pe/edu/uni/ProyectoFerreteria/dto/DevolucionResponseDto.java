package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class DevolucionResponseDto {

    private Integer cod_reclamo;
    private Integer cod_devolucion;
    private Integer cod_venta;
    private Integer cod_cliente;
    private Float monto_devolucion;
    private String mensaje;
}