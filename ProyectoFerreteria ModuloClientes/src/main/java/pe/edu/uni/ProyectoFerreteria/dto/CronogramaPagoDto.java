package pe.edu.uni.ProyectoFerreteria.dto;

import java.util.List;

import lombok.Data;

@Data
public class CronogramaPagoDto {
	private CronogramaCabeceraDto cabecera;
	private List<CronogramaDetalleDto> pagos;
}
