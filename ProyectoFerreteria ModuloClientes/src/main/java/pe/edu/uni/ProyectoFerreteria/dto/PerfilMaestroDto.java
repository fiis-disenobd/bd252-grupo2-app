package pe.edu.uni.ProyectoFerreteria.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PerfilMaestroDto {
    // Sección Izquierda: Perfil
    private String nombre;
    private String ruc;
    private String telefono;
    private String correo;
    private String direccion;
    private String especialidad;
    private String fechaRegistro;

    // Sección Arriba: Tarjetas Estadísticas
    private Integer comprasTotales; // O canjes totales
    private Double puntosGastados;
    private Integer referidos;
    private Double puntosActuales;

    // Sección Centro: Gráfico
    private List<GraficoCanjeDto> graficoCanjes;

    // Sección Abajo: Tabla Historial
    private List<HistorialCanjeDto> historialCanjes;
}