import { Check, Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react'
import { EstadoPedido } from '@/types'
import { cn } from '@/lib/utils'

interface PedidoTimelineProps {
  estado: EstadoPedido
  paidAt?: string | null
  shippedAt?: string | null
}

const pasos = [
  { id: 'pagado', label: 'Pagado', icon: Check },
  { id: 'en_produccion', label: 'En producción', icon: Package },
  { id: 'enviado', label: 'Enviado', icon: Truck },
  { id: 'entregado', label: 'Entregado', icon: CheckCircle },
]

// Timeline visual del estado del pedido
export function PedidoTimeline({ estado, paidAt, shippedAt }: PedidoTimelineProps) {
  if (estado === 'cancelado') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg text-red-700">
        <XCircle className="w-6 h-6" />
        <span className="font-medium">Pedido cancelado</span>
      </div>
    )
  }

  if (estado === 'pendiente') {
    return (
      <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg text-yellow-700">
        <Clock className="w-6 h-6" />
        <span className="font-medium">Pendiente de pago</span>
      </div>
    )
  }

  const estadoIndex = pasos.findIndex((p) => p.id === estado)

  return (
    <div className="flex items-center justify-between">
      {pasos.map((paso, index) => {
        const Icon = paso.icon
        const isCompleted = index <= estadoIndex
        const isCurrent = index === estadoIndex

        return (
          <div key={paso.id} className="flex-1 flex items-center">
            {/* Paso */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={cn(
                  'text-xs mt-2 text-center',
                  isCurrent ? 'font-semibold text-gray-900' : 'text-gray-500'
                )}
              >
                {paso.label}
              </span>
            </div>

            {/* Línea conectora */}
            {index < pasos.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-2',
                  index < estadoIndex ? 'bg-green-500' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
