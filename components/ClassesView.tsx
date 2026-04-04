
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Search, 
  Filter, 
  ChevronRight, 
  Dumbbell, 
  CheckCircle2, 
  XCircle,
  Plus,
  Loader2,
  Trash2
} from 'lucide-react';
import { User, GroupClass, ClassCategory, Gym, BookingStatus, ClassBooking, UserRole } from '../types';

interface ClassesViewProps {
  currentUser: User;
}

const ClassesView: React.FC<ClassesViewProps> = ({ currentUser }) => {
  const [classes, setClasses] = useState<GroupClass[]>([]);
  const [myBookings, setMyBookings] = useState<ClassBooking[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedGym, setSelectedGym] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);

  const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN;
  const isInstructor = currentUser.role === UserRole.INSTRUCTOR;
  const isMember = currentUser.role === UserRole.MIEMBRO;

  const categories = Object.values(ClassCategory);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classesRes, gymsRes, bookingsRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/gyms'),
        isMember ? fetch('/api/classes/my-bookings') : Promise.resolve({ json: () => [] })
      ]);

      const classesData = await classesRes.json();
      const gymsData = await gymsRes.json();
      const bookingsData = await bookingsRes.json();

      setClasses(classesData);
      setGyms(gymsData);
      if (isMember) setMyBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching classes data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (classId: string) => {
    // For demo, we use today's date if it matches the diaSemana, or next available
    const today = new Date();
    setBookingLoading(classId);
    try {
      const response = await fetch('/api/classes/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, fecha: today.toISOString() })
      });

      if (response.ok) {
        alert('¡Reserva exitosa!');
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al reservar');
      }
    } catch (error) {
      alert('Error en el servidor');
    } finally {
      setBookingLoading(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('¿Estás seguro de cancelar tu reserva?')) return;
    try {
      const response = await fetch(`/api/classes/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al cancelar');
      }
    } catch (error) {
      alert('Error en el servidor');
    }
  };

  const filteredClasses = classes.filter(c => {
    const categoryMatch = selectedCategory === 'ALL' || c.categoria === selectedCategory;
    const gymMatch = selectedGym === 'ALL' || c.gymId === selectedGym;
    return categoryMatch && gymMatch;
  });

  const getDayName = (day: number) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[day];
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            Clases Grupales
          </h1>
          <p className="text-gray-400 mt-1">Explora y reserva tus sesiones favoritas en AurumFit.</p>
        </div>
        
        {(isAdmin || isInstructor) && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-900/20 active:scale-95"
          >
            <Plus size={20} />
            Nueva Clase
          </button>
        )}
      </div>

      {/* FILTROS */}
      <div className="flex flex-wrap gap-4 bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700">
          <Filter size={18} className="text-orange-500" />
          <select 
            className="bg-transparent text-white outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">Todas las Categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700">
          <MapPin size={18} className="text-orange-500" />
          <select 
            className="bg-transparent text-white outline-none"
            value={selectedGym}
            onChange={(e) => setSelectedGym(e.target.value)}
          >
            <option value="ALL">Todas las Sucursales</option>
            {gyms.map(gym => (
              <option key={gym.id} value={gym.id}>{gym.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* MIS RESERVAS (Solo para Miembros) */}
      {isMember && myBookings.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="text-green-500" size={24} />
            Mis Próximas Clases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myBookings.filter(b => b.status === BookingStatus.RESERVED).map(booking => (
              <div key={booking.id} className="bg-gray-900/80 p-5 rounded-2xl border border-gray-800 hover:border-green-500/30 transition-all shadow-xl group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{booking.clase?.nombre}</h3>
                    <p className="text-orange-500 text-sm font-semibold">{booking.clase?.categoria}</p>
                  </div>
                  <button 
                    onClick={() => handleCancelBooking(booking.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Cancelar Reserva"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
                
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{new Date(booking.fecha).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{booking.clase?.horaInicio} - {booking.clase?.horaFin}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{booking.clase?.gym?.nombre}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CLASES DISPONIBLES */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Clases Disponibles</h2>
        
        {filteredClasses.length === 0 ? (
          <div className="bg-gray-900/50 p-12 rounded-3xl border border-dashed border-gray-800 text-center">
            <Dumbbell className="mx-auto text-gray-700 mb-4" size={64} />
            <p className="text-gray-400 text-lg">No encontramos clases con esos filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClasses.map(c => {
              const isBooked = myBookings.some(b => b.classId === c.id && b.status === BookingStatus.RESERVED);
              const spotsLeft = c.capacidad - (c.bookings?.filter(b => b.status === BookingStatus.RESERVED).length || 0);

              return (
                <div key={c.id} className="bg-gray-900 overflow-hidden rounded-3xl border border-gray-800 hover:border-orange-500/30 transition-all duration-300 flex flex-col group hover:shadow-2xl hover:shadow-orange-500/5">
                  <div className="h-40 bg-gradient-to-br from-gray-800 to-gray-900 relative p-6 flex flex-col justify-end overflow-hidden">
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-orange-400 border border-orange-500/20 capitalize">
                      {c.categoria.toLowerCase()}
                    </div>
                    <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Dumbbell size={120} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white z-10">{c.nombre}</h3>
                  </div>

                  <div className="p-6 space-y-4 flex-grow">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-gray-500 flex items-center gap-1">
                          <Calendar size={14} /> Día
                        </p>
                        <p className="text-gray-200 font-medium">{getDayName(c.diaSemana)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-500 flex items-center gap-1">
                          <Clock size={14} /> Hora
                        </p>
                        <p className="text-gray-200 font-medium">{c.horaInicio}</p>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className="text-gray-500 flex items-center gap-1">
                        <MapPin size={14} /> Sucursal
                      </p>
                      <p className="text-gray-200 font-medium">{c.gym?.nombre}</p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                       <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold border border-orange-500/20">
                        {c.instructor?.nombre?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Instructor</p>
                        <p className="text-sm font-bold text-white">{c.instructor?.nombre}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 mt-auto">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${spotsLeft <= 5 ? 'text-red-400 bg-red-400/10' : 'text-green-400 bg-green-400/10'}`}>
                        {spotsLeft} lugares disponibles
                      </span>
                    </div>

                    <button
                      onClick={() => isMember && !isBooked && handleBook(c.id)}
                      disabled={isBooked || spotsLeft === 0 || bookingLoading === c.id || !isMember}
                      className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        isBooked 
                          ? 'bg-green-500/10 text-green-500 cursor-default border border-green-500/20' 
                          : spotsLeft === 0
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                            : !isMember
                              ? 'bg-gray-800 text-gray-500 border border-gray-700'
                              : 'bg-white text-black hover:bg-orange-500 hover:text-white active:scale-95'
                      }`}
                    >
                      {bookingLoading === c.id ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : isBooked ? (
                        <><CheckCircle2 size={18} /> Reservado</>
                      ) : spotsLeft === 0 ? (
                        'Clase Agotada'
                      ) : !isMember ? (
                        'Info de Clase'
                      ) : (
                        'Reservar Lugar'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default ClassesView;
