import { Link } from "react-router-dom";

function WorkerCard({ worker }) {
  // समजा काही डेटा मिसिंग असेल तर डिफॉल्ट व्हॅल्यूज
  const {
    id,
    name = "Professional Worker",
    profession = "Specialist",
    rating = "5.0",
    price = "300",
    description = "Expert professional providing high-quality services in your local area.",
    image
  } = worker;

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full font-sans">
      
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image || "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=400"}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Rating Badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-slate-900 flex items-center gap-1 shadow-sm">
          <span className="text-yellow-500 text-sm">★</span> {rating}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
            {name}
          </h3>
          <p className="text-sm font-black text-blue-600 uppercase tracking-widest mt-1">
            {profession}
          </p>
        </div>

        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 line-clamp-2">
          {description}
        </p>

        {/* Footer Section */}
        <div className="mt-auto pt-5 border-t border-slate-100 flex justify-between items-center">
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter">
              Starting from
            </span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-black text-slate-900">₹{price}</span>
              <span className="text-xs font-bold text-slate-400">/hr</span>
            </div>
          </div>

          <Link to={`/worker/${id}`}>
            <button className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-100">
              View Profile
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WorkerCard;