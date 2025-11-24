package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class OrdenPendienteRecepcionDto {
    private Integer cod_orden;
    private String nombre_comercial;
    private String fecha_emision;
    private String estado;
}
