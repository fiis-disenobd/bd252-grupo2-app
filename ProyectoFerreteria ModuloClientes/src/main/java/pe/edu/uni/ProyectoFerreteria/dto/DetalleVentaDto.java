package pe.edu.uni.ProyectoFerreteria.dto;

import java.util.List;

import lombok.Data;

@Data
public class DetalleVentaDto {
	private DetalleVentaCabeceraDto cabecera;
    private List<DetalleVentaProdDto> detalles;
}
