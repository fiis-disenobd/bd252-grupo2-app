package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class AnulacionDto {
	private String anulacion;
	private String cliente;
	private String vendedor;
	private String fecha;
	private String monto;
	private String motivo;
}
