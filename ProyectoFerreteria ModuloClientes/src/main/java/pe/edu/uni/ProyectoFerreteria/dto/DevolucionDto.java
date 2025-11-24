package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class DevolucionDto {
	private String devolucion;
	private String venta;
	private String nombre_producto;
	private Float monto_devuelto;
	private String motivo_devolucion;
}
