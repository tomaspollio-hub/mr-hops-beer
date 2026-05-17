export default function ShippingPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-widest text-hops-green mb-2">Información legal</p>
      <h1 className="font-display text-5xl md:text-6xl uppercase text-hops-white mb-10">Política de envíos</h1>

      <div className="space-y-8 text-hops-muted leading-relaxed">

        <section>
          <h2 className="font-display text-2xl text-hops-white uppercase mb-3">Zona de entrega</h2>
          <p>Actualmente realizamos envíos únicamente dentro de la ciudad de <strong className="text-hops-white">Neuquén Capital y alrededores</strong> (Q8302). No realizamos envíos a otras provincias ni localidades por el momento.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-hops-white uppercase mb-3">Costo de envío</h2>
          <p>El envío a domicilio dentro de la zona de cobertura es <strong className="text-hops-white">sin cargo</strong>.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-hops-white uppercase mb-3">Tiempo de entrega</h2>
          <p>El tiempo de entrega queda sujeto a la disponibilidad de stock al momento del pedido. Una vez confirmado el pedido, nos comunicaremos con el cliente a través de WhatsApp para coordinar la fecha y horario de entrega.</p>
          <p className="mt-3">También podés retirar tu pedido directamente en nuestro local en <strong className="text-hops-white">Neuquén (Q8302)</strong>, previa coordinación.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-hops-white uppercase mb-3">Condiciones de entrega</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>El pedido será entregado a la persona que figure como titular del pedido, o a quien esta designe.</li>
            <li>Al momento de la entrega se verificará la mayoría de edad del receptor (18 años o más), en cumplimiento de la legislación vigente sobre venta de bebidas alcohólicas.</li>
            <li>Si el destinatario no se encuentra en el domicilio, coordinaremos una nueva entrega por WhatsApp.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-hops-white uppercase mb-3">Contacto</h2>
          <p>Ante cualquier consulta sobre tu envío, contactanos por WhatsApp o Instagram <strong className="text-hops-white">@mr.hopsbeer</strong>.</p>
        </section>

        <p className="text-xs text-hops-border pt-4 border-t border-hops-border">Última actualización: mayo 2025. Titular: Julián Marcelo Pesci — CUIT 20-36257061-2.</p>
      </div>
    </div>
  )
}
