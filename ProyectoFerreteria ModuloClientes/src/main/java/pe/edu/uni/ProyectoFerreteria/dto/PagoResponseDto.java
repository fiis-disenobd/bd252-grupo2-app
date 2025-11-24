package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class PagoResponseDto {
    private Integer cod_pago;
    private Integer nro_cuota;
    private Float monto_pagado;
    private String fecha_pago;
    private String mensaje;
}
