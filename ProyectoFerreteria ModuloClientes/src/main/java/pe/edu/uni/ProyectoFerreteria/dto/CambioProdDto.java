package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class CambioProdDto {
	private String cambio_prod;
	private String venta;
	private String cliente;
	private String producto_devuelto;
	private String producto_nuevo;
	private String diferencia;
	private String fecha;
}
