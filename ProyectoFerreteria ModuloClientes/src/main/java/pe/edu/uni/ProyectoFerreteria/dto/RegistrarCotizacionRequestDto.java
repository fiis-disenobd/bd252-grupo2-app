package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class RegistrarCotizacionRequestDto {
    // Datos de la URL o contexto
    private Integer cod_solicitud; 
    
    // Datos del Formulario
    private Integer cod_proveedor;
    private String fecha_emision_cotizacion;
    private String fecha_garantia;
    private Integer plazo_entrega;
    private BigDecimal monto_total;

    // Tabla de Precios
    private List<CotizacionItemRequestDto> productosCotizados;
}
