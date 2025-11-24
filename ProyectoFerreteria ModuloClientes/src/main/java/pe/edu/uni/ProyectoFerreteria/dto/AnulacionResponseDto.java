package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class AnulacionResponseDto {

    private Integer cod_reclamo;
    private Integer cod_anulacion;
    private Integer cod_venta;
    private Integer cod_cliente;
    private String mensaje;
}
