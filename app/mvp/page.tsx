"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Actividad {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  imagen: string;
  curso_id: string;
}

interface Curso {
  id: string;
  nombre: string;
}

export default function MVPPage() {
  const router = useRouter();
  const [titulo, setTitulo] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [imagen, setImagen] = useState<string>("");
  const [tipo, setTipo] = useState<string>("tarea");
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>("");
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCursos = async () => {
    const { data, error } = await supabase
      .from("cursos")
      .select("id, nombre")
      .order("nombre", { ascending: true });
    if (error) {
      console.error("❌ Error al cargar cursos:", error.message);
    } else {
      setCursos(data || []);
    }
  };

  const fetchActividades = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMensaje("⚠️ No hay usuario logueado");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("actividades")
      .select("id, titulo, descripcion, tipo, imagen, curso_id")
      .eq("estudiante_id", user.id)
      .order("id", { ascending: false });
    if (error) {
      console.error("❌ Error al cargar actividades:", error.message);
    } else {
      setActividades(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMensaje("⚠️ Debes iniciar sesión para subir actividades");
      return;
    }
    const { error } = await supabase.from("actividades").insert([
      {
        titulo,
        descripcion,
        tipo,
        imagen,
        curso_id: cursoSeleccionado,
        estudiante_id: user.id,
      },
    ]);

    if (error) {
      setMensaje("❌ Error al subir actividad: " + error.message);
    } else {
      setMensaje("✅ Actividad subida correctamente");
      setTitulo("");
      setDescripcion("");
      setImagen("");
      setCursoSeleccionado("");
      fetchActividades();
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    fetchCursos();
    fetchActividades();
  }, []);

  if (loading) return <p className="text-center">⏳ Cargando...</p>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold text-center mb-6">Subir Actividad (MVP)</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-8">
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="border p-2 rounded"
        />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="border p-2 rounded">
          <option value="tarea">Tarea</option>
          <option value="examen">Examen</option>
          <option value="proyecto">Proyecto</option>
          <option value="participacion">Participación</option>
          <option value="otro">Otro</option>
        </select>
        <select
          value={cursoSeleccionado}
          onChange={(e) => setCursoSeleccionado(e.target.value)}
          required
          className="border p-2 rounded"
        >
          <option value="">Selecciona un curso</option>
          {cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.nombre}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="URL de imagen"
          value={imagen}
          onChange={(e) => setImagen(e.target.value)}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Subir Actividad
        </button>
      </form>
      {mensaje && <p className="text-center mb-4">{mensaje}</p>}
      <h2 className="text-xl font-semibold mb-3 text-center">Mis Actividades</h2>
      {actividades.length === 0 ? (
        <p className="text-center text-gray-600">No has subido actividades aún.</p>
      ) : (
        <div className="space-y-4">
          {actividades.map((act) => (
            <div key={act.id} className="border p-4 rounded shadow-sm">
              <h3 className="font-semibold">{act.titulo}</h3>
              <p className="text-gray-700">{act.descripcion}</p>
              <p className="text-sm text-gray-500 mt-1">Tipo: {act.tipo.toUpperCase()}</p>
              {act.imagen && (
                <img src={act.imagen} alt={act.titulo} className="rounded mt-2 w-full max-w-md object-cover" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}