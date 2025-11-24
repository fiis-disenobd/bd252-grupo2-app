package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class AnulacionRequestDto {

    private Integer cod_venta;
    private Integer cod_motivo_anulacion;
    private String descp_anulacion;   // opcional
}
