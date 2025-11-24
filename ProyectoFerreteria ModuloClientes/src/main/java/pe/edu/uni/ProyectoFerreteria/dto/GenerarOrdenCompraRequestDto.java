package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;
import java.util.List;

@Data
public class GenerarOrdenCompraRequestDto {
    private Integer cod_solicitud;
    private List<ItemAdjudicacionDto> items_adjudicados;
}
