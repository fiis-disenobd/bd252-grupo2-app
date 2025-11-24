package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class CambioProductoRequestDto {

    private Integer cod_venta;

    private Integer cod_caja;
    private Integer cod_motivo_cambio_prod;

    private Integer cod_producto_retorna;   // producto que el cliente devuelve
    private Integer cod_producto_entrega;   // producto nuevo que se entrega

    private Float diferencia_cambio;        // opcional, si es null se calcula con dif_cambio()
    private String descp_cambio;            // descripción opcional
}

