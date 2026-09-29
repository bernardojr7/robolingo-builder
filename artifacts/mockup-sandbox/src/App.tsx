import { useEffect, useState, type ComponentType } from "react";
import { modules as discoveredModules } from "./.generated/mockup-components";

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

function _resolveComponent(
  mod: Record<string, unknown>,
  name: string,
): ComponentType | undefined {
  const fns = Object.values(mod).filter(
    (v) => typeof v === "function",
  ) as ComponentType[];
  return (
    (mod.default as ComponentType) ||
    (mod.Preview as ComponentType) ||
    (mod[name] as ComponentType) ||
    fns[fns.length - 1]
  );
}

function PreviewRenderer({
  componentPath,
  modules,
}: {
  componentPath: string;
  modules: ModuleMap;
}) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setComponent(null);
    setError(null);

    async function loadComponent(): Promise<void> {
      const key = `./components/mockups/${componentPath}.tsx`;
      const loader = modules[key];
      if (!loader) {
        setError(`Nenhum componente encontrado em ${componentPath}.tsx`);
        return;
      }

      try {
        const mod = await loader();
        if (cancelled) return;
        
        const name = componentPath.split("/").pop()!;
        const comp = _resolveComponent(mod, name);
        if (!comp) {
          setError(
            `Nenhum componente React exportado encontrado em ${componentPath}.tsx`,
          );
          return;
        }
        setComponent(() => comp);
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : String(e);
        setError(`Falha ao carregar componente.\n${message}`);
      }
    }

    void loadComponent();

    return () => {
      cancelled = true;
    };
  }, [componentPath, modules]);

  if (error) {
    return (
      <pre style={{ color: "red", padding: "2rem", fontFamily: "system-ui" }}>
        {error}
      </pre>
    );
  }

  if (!Component) return null;

  return <Component />;
}

function getBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

// Mapeia automaticamente todos os componentes disponíveis no projeto
function getAvailableComponents(): string[] {
  return Object.keys(discoveredModules).map((key) =>
    key.replace(/^\.\/components\/mockups\//, "").replace(/\.tsx$/, "")
  );
}

function Gallery() {
  const basePath = getBasePath();
  const components = getAvailableComponents();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-indigo-400">
            Robolingo Builder — Galeria
          </h1>
          <p className="text-slate-400 mt-2">
            Selecione uma tela ou componente abaixo para visualizar:
          </p>
        </header>

        {components.length === 0 ? (
          <p className="text-slate-500">Nenhum componente encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {components.map((name) => (
              <a
                key={name}
                href={`${basePath}/preview/${name}`}
                className="group block p-5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/60 hover:border-indigo-500 transition-all duration-200 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                    {name}
                  </span>
                  <span className="text-xs font-mono text-slate-500 group-hover:text-indigo-400">
                    &rarr;
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getPreviewPath(): string | null {
  const basePath = getBasePath();
  const { pathname } = window.location;
  const local =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || "/"
      : pathname;
  const match = local.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
}

function App() {
  const previewPath = getPreviewPath();

  if (previewPath) {
    return (
      <PreviewRenderer
        componentPath={previewPath}
        modules={discoveredModules}
      />
    );
  }

  // Exibe a galeria com todos os componentes clicáveis ao acessar a raiz "/"
  return <Gallery />;
}

export default App;
