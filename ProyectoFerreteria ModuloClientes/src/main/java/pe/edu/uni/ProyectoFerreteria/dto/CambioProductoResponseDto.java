package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class CambioProductoResponseDto {

    private Integer cod_reclamo;
    private Integer cod_cambio_prod;

    private Integer cod_venta;
    private Integer cod_cliente;

    private Integer producto_retorna;
    private Integer producto_entrega;
    private Float diferencia_cambio;

    private String mensaje;
}
