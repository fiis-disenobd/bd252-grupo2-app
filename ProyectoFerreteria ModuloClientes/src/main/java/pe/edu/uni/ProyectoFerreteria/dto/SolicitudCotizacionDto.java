package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class SolicitudCotizacionDto {
	private Integer cod_solicitud;
    private String fecha_emision;
    private String estado;
    private Integer total_de_items;
}
