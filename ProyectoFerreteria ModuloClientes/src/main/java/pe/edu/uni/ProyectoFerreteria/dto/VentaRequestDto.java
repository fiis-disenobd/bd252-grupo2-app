package pe.edu.uni.ProyectoFerreteria.dto;

import java.util.List;

import lombok.Data;

@Data
public class VentaRequestDto {
    private Integer cod_cond_pago;
    private Integer nro_cuotas;
    private Integer cod_cliente;
    private Integer cod_vendedor;
    private Integer cod_tipo_comprobante;
    private String nro_comprobante;
    private Integer cod_metodo_pago;
    private Integer cod_caja;
    private String nombre_pagador;
    private String nro_telf_pagador;

    private List<ItemVentaDto> items;
}

