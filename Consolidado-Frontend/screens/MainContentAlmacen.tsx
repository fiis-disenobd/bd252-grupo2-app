import React, { useState } from 'react';
// Importamos iconos (asegúrate de tenerlos o usa lucide-react como placeholder)
import { 
    HomeIcon, UsersIcon, BoxIcon, SearchIcon, ClipboardListIcon, 
    TruckIcon, AlertTriangleIcon, ChartBarIcon 
} from '../components/icons/IconsAlmacen'; 

// IMPORTAMOS EL ENUM DEL SIDEBAR (Conexión Clave)
import { SidebarItemId } from '../components/Sidebar'; 

// Importamos componentes hijos
import ContentCard from './ContentCard';
import TeamManagement from './TeamManagement';
import AssignOperator from './AssignOperator';
import TeamDashboard from './TeamDashboard';
import OperatorManagement from './OperatorManagement';
import GoodsReception from './GoodsReception';
import ReceptionDetail from './ReceptionDetail';
import InventoryQuery from './InventoryQuery';
import PickingList from './PickingList';
import PickingDetail from './PickingDetail';
import CycleCountList from './CycleCountList';
import CycleCountDetail from './CycleCountDetail';
import StockControl from './StockControl';
import CapacityManagement from './CapacityManagement';
import MovementReport from './MovementReport';
import IncidentsReport from './IncidentsReport';

import type { Task, InventoryProduct, Product, Operator } from '../types';
import { ViewAlmacen } from '../types';

// 1. DEFINIMOS LA INTERFAZ AQUÍ (COLOCATION)
// Añadimos 'targetView' para saber exactamente a dónde ir sin mapas extra
export interface ContentCardType {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    category: SidebarItemId;
    targetView: ViewAlmacen; // <--- ESTO ELIMINA LA NECESIDAD DE 'cardToViewMap'
}

// 2. DEFINIMOS LAS TARJETAS DE INVENTARIO AQUÍ
// Así tienes control total de qué botón lleva a qué vista
const INVENTORY_CARDS: ContentCardType[] = [
    {
        id: 'manage-team',
        label: 'Gestión de Equipo',
        icon: UsersIcon,
        category: SidebarItemId.Inventario,
        targetView: 'team-dashboard'
    },
    {
        id: 'receive-goods',
        label: 'Recepción de Mercadería',
        icon: BoxIcon,
        category: SidebarItemId.Inventario,
        targetView: 'goods-reception'
    },
    {
        id: 'inventory-query',
        label: 'Consulta de Inventario',
        icon: SearchIcon,
        category: SidebarItemId.Inventario,
        targetView: 'inventory-query'
    },
    {
        id: 'stock-control',
        label: 'Control de Stock',
        icon: ClipboardListIcon,
        category: SidebarItemId.Inventario,
        targetView: 'stock-control'
    },
    {
        id: 'picking',
        label: 'Picking y Preparación',
        icon: BoxIcon,
        category: SidebarItemId.Inventario,
        targetView: 'picking-list'
    },
    {
        id: 'cycle-count',
        label: 'Conteo Cíclico',
        icon: ClipboardListIcon,
        category: SidebarItemId.Inventario,
        targetView: 'cycle-count-list'
    },
    {
        id: 'capacity-management',
        label: 'Gestión de Capacidad',
        icon: BoxIcon,
        category: SidebarItemId.Inventario,
        targetView: 'capacity-management-view'
    },
    {
        id: 'movement-report',
        label: 'Reporte de Movimientos',
        icon: TruckIcon,
        category: SidebarItemId.Inventario,
        targetView: 'movement-report-view'
    },
    {
        id: 'incidents',
        label: 'Incidentes',
        icon: AlertTriangleIcon,
        category: SidebarItemId.Inventario,
        targetView: 'incidents-view'
    }
];

interface MainContentProps {
    activeCategory: SidebarItemId; // Ahora TypeScript reconoce esto
    currentView: ViewAlmacen;
    setCurrentView: (view: ViewAlmacen) => void;
    onGoHome: () => void;
    inventory: InventoryProduct[];
    onUpdateInventory: (receivedQuantities: Record<string, number>, products: Product[]) => void;
    tasks: Task[];
    operators: Operator[];
    onAddOperator: (operator: Operator) => void;
    onAssignOperators: (taskId: string, operators: Operator[]) => void;
    onFinishPicking: (taskId: string, pickedProducts: Map<string, number>) => void;
    onFinishCycleCount: (taskId: string, countedQuantities: Map<string, number>) => void;
    onUpdateStockLimits: (sku: string, newMinStock: number, newMaxStock: number) => void;
    onResolveStock: (sku: string, returnQty: number, discardQty: number) => void;
}

const MainContent: React.FC<MainContentProps> = ({ 
    activeCategory, currentView, setCurrentView, onGoHome, inventory, 
    onUpdateInventory, tasks, operators, onAddOperator, onAssignOperators, 
    onFinishPicking, onFinishCycleCount, onUpdateStockLimits, onResolveStock 
}) => {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Handlers auxiliares
    const handleAssignClick = (task: Task) => { setSelectedTask(task); setCurrentView('assign-operator'); };
    const handleReceptClick = (task: Task) => { setSelectedTask(task); setCurrentView('reception-detail'); };
    const handleProcessPickingClick = (task: Task) => { setSelectedTask(task); setCurrentView('picking-detail'); };
    const handleProcessCountClick = (task: Task) => { setSelectedTask(task); setCurrentView('cycle-count-detail'); };

    // ============================================================
    // 3. RENDERIZADO DE SUB-VISTAS (ROUTER)
    // ============================================================
    // Este bloque maneja qué componente mostrar cuando NO estamos en el menú principal
    if (activeCategory === SidebarItemId.Inventario) {
        // Vistas de Equipo
        if (currentView === 'team-dashboard') return <TeamDashboard onNavigate={setCurrentView} onBack={() => setCurrentView('dashboard')} onHome={onGoHome} />;
        if (currentView === 'team-management') return <TeamManagement tasks={tasks} onBack={() => setCurrentView('team-dashboard')} onHome={onGoHome} onAssign={handleAssignClick} />;
        if (currentView === 'operator-management') return <OperatorManagement operators={operators} onAddOperator={onAddOperator} onBack={() => setCurrentView('team-dashboard')} onHome={onGoHome} />;
        if (currentView === 'assign-operator' && selectedTask) return <AssignOperator task={selectedTask} operators={operators} onBack={() => setCurrentView('team-management')} onHome={onGoHome} onAssignOperators={onAssignOperators} />;
        
        // Vistas de Recepción
        if (currentView === 'goods-reception') return <GoodsReception tasks={tasks} onBack={() => setCurrentView('dashboard')} onHome={onGoHome} onRecept={handleReceptClick} />;
        if (currentView === 'reception-detail' && selectedTask) return <ReceptionDetail task={selectedTask} onBack={() => setCurrentView('goods-reception')} onHome={onGoHome} onUpdateInventory={onUpdateInventory} />;
        
        // Vistas de Inventario y Stock
        if (currentView === 'inventory-query') return <InventoryQuery onBack={() => setCurrentView('dashboard')} onHome={onGoHome} inventoryData={inventory} />;
        if (currentView === 'stock-control') return <StockControl onBack={() => setCurrentView('dashboard')} onHome={onGoHome} inventoryData={inventory} onUpdateStockLimits={onUpdateStockLimits} onResolveStock={onResolveStock} />;
        
        // Vistas de Picking
        if (currentView === 'picking-list') return <PickingList tasks={tasks} onBack={() => setCurrentView('dashboard')} onHome={onGoHome} onProcessPicking={handleProcessPickingClick} />;
        if (currentView === 'picking-detail' && selectedTask) return <PickingDetail task={selectedTask} onBack={() => setCurrentView('picking-list')} onHome={onGoHome} onFinishPicking={(pickedProducts) => { onFinishPicking(selectedTask.id, pickedProducts); setCurrentView('picking-list'); }} />;
        
        // Vistas de Conteo
        if (currentView === 'cycle-count-list') return <CycleCountList tasks={tasks} onBack={() => setCurrentView('dashboard')} onHome={onGoHome} onProcessCount={handleProcessCountClick} />;
        if (currentView === 'cycle-count-detail' && selectedTask) return <CycleCountDetail task={selectedTask} inventory={inventory} onBack={() => setCurrentView('cycle-count-list')} onHome={onGoHome} onFinishCount={(countedQuantities) => { onFinishCycleCount(selectedTask.id, countedQuantities); setCurrentView('cycle-count-list'); }} />;
        
        // Otras vistas
        if (currentView === 'capacity-management-view') return <CapacityManagement onBack={() => setCurrentView('dashboard')} onHome={onGoHome} />;
        if (currentView === 'movement-report-view') return <MovementReport onBack={() => setCurrentView('dashboard')} onHome={onGoHome} />;
        if (currentView === 'incidents-view') return <IncidentsReport onBack={() => setCurrentView('dashboard')} onHome={onGoHome} />;
    }

    // ============================================================
    // 4. RENDERIZADO DE TARJETAS (MENÚ PRINCIPAL)
    // ============================================================
    
    // Filtramos las tarjetas según la categoría activa en el Sidebar
    // Nota: Si estás en 'Ventas', usarías otra lista, o concatenas listas aquí.
    // Por ahora, usamos INVENTORY_CARDS.
    const filteredCards = INVENTORY_CARDS.filter(card => card.category === activeCategory);

    return (
        <div>
            {/* Header con botón Home */}
            <div className="flex justify-between items-center mb-8">
                 <button onClick={onGoHome} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
                    <HomeIcon className="w-5 h-5" />
                    <span>Home</span>
                </button>
            </div>

            {/* Grid de Tarjetas */}
            {filteredCards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredCards.map((card) => (
                        <ContentCard 
                            key={card.id} 
                            icon={card.icon} 
                            label={card.label} 
                            onClick={() => {
                                // LÓGICA SIMPLIFICADA: Usamos la propiedad directa de la tarjeta
                                setCurrentView(card.targetView);
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
                    <p className="text-gray-500 text-lg">
                        Seleccione una opción del menú lateral (ej. Inventario)
                    </p>
                </div>
            )}
        </div>
    );
};

export default MainContent;