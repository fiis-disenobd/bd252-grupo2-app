package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class PagoRealizadoDto {
	private String venta;
	private String cuota;
	private String fecha;
	private String monto;
}
