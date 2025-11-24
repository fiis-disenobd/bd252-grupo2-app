package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class PagoPendienteDto {
	private String venta;
	private String cliente;
	private String cuota;
	private String fecha_vencimiento;
	private String monto;
	private String condicion;
}
