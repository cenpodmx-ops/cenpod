"use client";

import { useNavigationStore } from "@/store/navigation";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const { navigate } = useNavigationStore();

  return (
    <footer className="bg-navy text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/images/logo-white.png"
                alt="CENPOD"
                className="h-10"
              />
              <span className="text-navy-200 text-xs">CENTRO PODOLÓGICO</span>
            </div>
            <p className="text-navy-200 text-sm leading-relaxed">
              Tu centro de confianza para productos de cuidado de pies. Para profesionales y público en general.
              Calidad y servicio desde México.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-4 text-white">
              Tienda
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Instrumentos", slug: "instrumentos" },
                { label: "Insumos", slug: "insumos" },
                { label: "Equipamiento", slug: "equipamiento" },
                { label: "Cuidado de Pies", slug: "cuidado-pies" },
              ].map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() =>
                      navigate("catalog", {
                        catalogFilters: {
                          q: "",
                          category: [cat.slug],
                          usage: [],
                          minPrice: 0,
                          maxPrice: 20000,
                          sort: "featured",
                        },
                      })
                    }
                    className="text-navy-200 text-sm hover:text-white transition-colors"
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm mb-4 text-white">
              Ayuda
            </h4>
            <ul className="space-y-2.5">
              {[
                "Preguntas frecuentes",
                "Envíos y entregas",
                "Devoluciones",
                "Términos y condiciones",
                "Aviso de privacidad",
              ].map((item) => (
                <li key={item}>
                  <span className="text-navy-200 text-sm hover:text-white transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm mb-4 text-white">
              Contacto
            </h4>
            <ul className="space-y-2.5 text-sm text-navy-200">
              <li>📞 +52 (55) 1234-5678</li>
              <li>📧 contacto@cenpod.mx</li>
              <li>📍 Ciudad de México, México</li>
            </ul>
            <div className="flex gap-3 mt-4">
              {["Facebook", "Instagram", "WhatsApp"].map((social) => (
                <span
                  key={social}
                  className="w-9 h-9 bg-navy-light rounded-lg flex items-center justify-center text-navy-200 hover:text-white hover:bg-navy-50/20 transition-colors cursor-pointer text-xs"
                >
                  {social[0]}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-navy-200 text-xs">
          <p>© {new Date().getFullYear()} CENPOD. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="px-2 py-1 bg-white/10 rounded text-[10px]">VISA</span>
            <span className="px-2 py-1 bg-white/10 rounded text-[10px]">MC</span>
            <span className="px-2 py-1 bg-white/10 rounded text-[10px]">OXXO</span>
            <span className="px-2 py-1 bg-white/10 rounded text-[10px]">Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
