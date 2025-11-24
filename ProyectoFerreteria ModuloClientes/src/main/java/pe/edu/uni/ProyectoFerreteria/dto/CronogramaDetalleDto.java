package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;

@Data
public class CronogramaDetalleDto {
	private String fecha_vecimiento;
	private String monto_pago;
	private String fecha_pago;
	private String metodo_pago;
	private String num_comprobante;
	private String tipo_comprobante;
}
