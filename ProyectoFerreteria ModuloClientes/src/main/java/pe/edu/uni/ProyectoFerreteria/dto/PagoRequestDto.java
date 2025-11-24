package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class PagoRequestDto {
    private Integer cod_venta;
    private Integer cod_metodo_pago;
    private Integer cod_caja;
    private Integer cod_comprobante;
    private String nombre_pagador;
    private String nro_telf_pagador;
}
