package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class VentaResponseDto {
    private Integer cod_venta;
    private Float monto_venta;
    private Float igv;
    private Float descuento;
    private Integer puntos_venta;
    private String mensaje;
}

