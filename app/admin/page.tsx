"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Estudiante {
  id: string;
  nombre: string;
  correo: string;
  telefono: string | null;
}

interface Curso {
  id: string;
  nombre: string;
}

interface Actividad {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: string;
  nota: number | null;
  imagen: string | null;
  creado_en: string;
  estudiante: Estudiante[] | Estudiante | null;
  curso: Curso[] | Curso | null;
}

export default function AdminPage() {
  const router = useRouter();
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");

  const fetchActividades = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("actividades")
      .select(`
        id,
        titulo,
        descripcion,
        tipo,
        nota,
        imagen,
        creado_en,
        estudiante:estudiantes!estudiante_id(id,nombre,correo,telefono),
        curso:cursos!curso_id(id,nombre)
      `)
      .order("creado_en", { ascending: false });
    if (error) {
      console.error(error.message);
      setMessage("❌ Error al cargar actividades");
    } else if (data) {
      setActividades(data);
    }
    setLoading(false);
  };

  const fetchEstudiantes = async () => {
    const { data, error } = await supabase
      .from("estudiantes")
      .select("*")
      .order("nombre", { ascending: true });
    if (error) {
      console.error(error.message);
      setMessage("❌ Error al cargar estudiantes");
    } else if (data) {
      setEstudiantes(data);
    }
  };

  useEffect(() => {
    const verificarAdmin = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else if (data.user.email !== "daniel.diazd@uniagustiniana.edu.co") {
        router.push("/login");
      } else {
        fetchActividades();
        fetchEstudiantes();
      }
    };
    verificarAdmin();
  }, [router]);

  const actualizarNota = async (id: string, nuevaNota: number) => {
    const { error } = await supabase.from("actividades").update({ nota: nuevaNota }).eq("id", id);
    if (error) setMessage("❌ Error al actualizar nota: " + error.message);
    else {
      setMessage("✅ Nota actualizada correctamente");
      fetchActividades();
    }
  };

  const actualizarEstudiante = async (id: string, nombre: string, telefono: string | null) => {
    const { error } = await supabase.from("estudiantes").update({ nombre, telefono }).eq("id", id);
    if (error) setMessage("❌ Error al actualizar estudiante: " + error.message);
    else {
      setMessage("✅ Estudiante actualizado correctamente");
      fetchEstudiantes();
      fetchActividades();
    }
  };

  const nombreEstudianteDe = (est: Estudiante[] | Estudiante | null) => {
    if (!est) return "Estudiante no encontrado";
    if (Array.isArray(est)) return est[0]?.nombre ?? "Estudiante no encontrado";
    return est.nombre ?? "Estudiante no encontrado";
  };

  const nombreCursoDe = (cur: Curso[] | Curso | null) => {
    if (!cur) return "Curso no encontrado";
    if (Array.isArray(cur)) return cur[0]?.nombre ?? "Curso no encontrado";
    return cur.nombre ?? "Curso no encontrado";
  };

  if (loading) return <p className="text-center mt-10">Cargando datos...</p>;

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6 space-y-10">
      <h1 className="text-3xl font-bold text-center">Panel Administrativo</h1>
      {message && <p className="text-center text-green-600">{message}</p>}

      <section>
        <h2 className="text-2xl font-semibold mb-4">Actividades</h2>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Estudiante</th>
              <th className="border p-2">Curso</th>
              <th className="border p-2">Actividad</th>
              <th className="border p-2">Tipo</th>
              <th className="border p-2">Nota</th>
              <th className="border p-2">Imagen</th>
              <th className="border p-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {actividades.map((act) => (
              <tr key={act.id}>
                <td className="border p-2">{nombreEstudianteDe(act.estudiante)}</td>
                <td className="border p-2">{nombreCursoDe(act.curso)}</td>
                <td className="border p-2">{act.titulo}</td>
                <td className="border p-2">{act.tipo}</td>
                <td className="border p-2">
                  <input
                    type="number"
                    step={0.1}
                    min={0}
                    max={5}
                    value={act.nota ?? 0}
                    onChange={(e) => actualizarNota(act.id, parseFloat(e.target.value))}
                    className="border p-1 w-16 text-center"
                  />
                </td>
                <td className="border p-2">
                  {act.imagen && <img src={act.imagen} alt="actividad" className="w-20 h-20 object-cover" />}
                </td>
                <td className="border p-2">
                  <button onClick={() => actualizarNota(act.id, act.nota ?? 0)} className="bg-blue-600 text-white px-2 py-1 rounded">
                    Guardar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Estudiantes</h2>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Correo</th>
              <th className="border p-2">Teléfono</th>
              <th className="border p-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.map((est) => (
              <tr key={est.id}>
                <td className="border p-2">
                  <input
                    type="text"
                    value={est.nombre}
                    onChange={(e) => (est.nombre = e.target.value)}
                    className="border p-1 w-full"
                  />
                </td>
                <td className="border p-2">{est.correo}</td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={est.telefono ?? ""}
                    onChange={(e) => (est.telefono = e.target.value)}
                    className="border p-1 w-full"
                  />
                </td>
                <td className="border p-2">
                  <button onClick={() => actualizarEstudiante(est.id, est.nombre, est.telefono)} className="bg-green-600 text-white px-2 py-1 rounded">
                    Guardar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}