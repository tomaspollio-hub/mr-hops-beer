export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-widest text-hops-green mb-2">Información legal</p>
      <h1 className="font-display text-5xl md:text-6xl uppercase text-hops-white mb-10">Política de privacidad</h1>

      <div className="space-y-8 text-hops-muted leading-relaxed">

        <section>
          <h2 className="font-display text-2xl text-hops-white uppercase mb-3">Responsable del tratamiento</h2>
          <p>Julián Marcelo Pesci (CUIT 20-36257061-2), titular de Mr. Hops Beer, con domicilio en Neuquén (Q8302), es responsable del tratamiento de los datos personales recabados a través de este sitio, en cumplimiento de la Ley 25.326 de Protección de Datos Personales de la República Argentina.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-hops-white uppercase mb-3">Datos que recolectamos</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Nombre y apellido</li>
            <li>Dirección de correo electrónico</li>
            <li>Número de teléfono / WhatsApp</li>
            <li>Domicilio de entrega</li>
            <li>Historial de pedidos y reservas</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-hops-white uppercase mb-3">Finalidad del tratamiento</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Gestionar y procesar los pedidos y reservas realizados en el sitio.</li>
            <li>Comunicarnos con el cliente para coordinar entregas o resolver consultas.</li>
            <li>Enviar notificaciones sobre el estado del pedido.</li>
            <li>Mejorar la experiencia de uso del sitio.</li>
          </ul>
          <p className="mt-3">No compartimos ni vendemos datos personales a terceros con fines comerciales.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-hops-white uppercase mb-3">Almacenamiento</h2>
          <p>Los datos se almacenan en servidores seguros. Las contraseñas se guardan cifradas y nunca en texto plano. Aplicamos medidas técnicas razonables para proteger la información contra accesos no autorizados.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-hops-white uppercase mb-3">Derechos del titular</h2>
          <p>En cualquier momento podés ejercer los derechos de <strong className="text-hops-white">acceso, rectificación, supresión y confidencialidad</strong> sobre tus datos personales, conforme al artículo 14 de la Ley 25.326. Para hacerlo, contactanos por WhatsApp o Instagram <strong className="text-hops-white">@mr.hopsbeer</strong>.</p>
          <p className="mt-3">La Dirección Nacional de Protección de Datos Personales (Órgano de Control de la Ley 25.326) tiene la atribución de atender las denuncias y reclamos que se interpongan en relación al incumplimiento de las normas sobre protección de datos personales.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-hops-white uppercase mb-3">Cookies</h2>
          <p>El sitio utiliza almacenamiento local del navegador (localStorage) para mantener la sesión iniciada y el carrito de compras. No utilizamos cookies de rastreo ni publicidad de terceros.</p>
        </section>

        <p className="text-xs text-hops-border pt-4 border-t border-hops-border">Última actualización: mayo 2025. Titular: Julián Marcelo Pesci — CUIT 20-36257061-2.</p>
      </div>
    </div>
  )
}
