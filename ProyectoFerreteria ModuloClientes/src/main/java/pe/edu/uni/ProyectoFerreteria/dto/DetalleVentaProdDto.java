package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class DetalleVentaProdDto {
	private String producto;
	private String descripcion;
	private Integer cantidad;
	private Float precio;
	private Float descuento;
	private Integer puntos;
	private Float monto;
	private String estado;
	private String direccion_entrega;
	private String fecha_entrega;
}
