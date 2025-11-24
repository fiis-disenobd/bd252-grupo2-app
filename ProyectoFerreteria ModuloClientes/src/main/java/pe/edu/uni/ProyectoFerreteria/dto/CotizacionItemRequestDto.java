package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CotizacionItemRequestDto {
    private Integer cod_producto;
    private BigDecimal costo_total;
    private String modalidad_pago;
}
