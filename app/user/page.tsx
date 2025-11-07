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

export default function UsuarioPage() {
  const router = useRouter();
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
  const [nombre, setNombre] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEstudiante = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMensaje("⚠️ No hay usuario logueado");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("estudiantes")
      .select("id, nombre, correo, telefono")
      .eq("id", user.id)
      .single();
    if (error) {
      console.error("❌ Error al cargar estudiante:", error.message);
      setMensaje("❌ No se encontró el estudiante");
    } else if (data) {
      setEstudiante(data);
      setNombre(data.nombre);
      setTelefono(data.telefono || "");
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!estudiante) return;
    const { error } = await supabase
      .from("estudiantes")
      .update({ nombre, telefono })
      .eq("id", estudiante.id);
    if (error) {
      setMensaje("❌ Error al actualizar: " + error.message);
    } else {
      setMensaje("✅ Datos actualizados correctamente");
      fetchEstudiante();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
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
    fetchEstudiante();
  }, []);

  if (loading) return <p className="text-center">⏳ Cargando...</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Mi Perfil</h1>
      {estudiante ? (
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre completo"
            required
            className="border p-2 rounded"
          />
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Teléfono"
            className="border p-2 rounded"
          />
          <input
            type="email"
            value={estudiante.correo}
            readOnly
            className="border p-2 rounded bg-gray-100 text-gray-600"
          />
          <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Guardar cambios
          </button>
        </form>
      ) : (
        <p className="text-center text-gray-600">{mensaje}</p>
      )}
      {mensaje && <p className="mt-4 text-center text-gray-700 font-medium">{mensaje}</p>}
      <button
        onClick={handleLogout}
        className="bg-gray-400 text-white p-2 rounded mt-4 w-full"
      >
        Cerrar sesión
      </button>
    </div>
  );
}