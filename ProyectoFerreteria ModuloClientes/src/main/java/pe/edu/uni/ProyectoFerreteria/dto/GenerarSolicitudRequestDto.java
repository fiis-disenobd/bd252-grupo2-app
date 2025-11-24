package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Data;
import java.util.List;

@Data
public class GenerarSolicitudRequestDto {
    private Integer cod_usuario;
    private List<ItemSeleccionadoDto> itemsSeleccionados;
}
