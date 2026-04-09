import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import workersData from "../data/workers";

function WorkerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const worker = workersData.find((w) => w.id === parseInt(id));

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [bookings, setBookings] = useState([]);

  // Load existing bookings from localStorage
  useEffect(() => {
    const storedBookings = localStorage.getItem("bookings");
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    }
  }, []);

  if (!worker) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Worker not found</p>;
  }

  const handleBooking = () => {
    if (!date || !time) {
      alert("Please select date and time");
      return;
    }

    const newBooking = {
      id: bookings.length + 1,
      workerName: worker.name,
      profession: worker.profession,
      date,
      time,
      price: worker.price,
    };

    const updatedBookings = [...bookings, newBooking];

    // Save to state and localStorage
    setBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));

    alert("Booking successful!");
    navigate("/bookings");
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial", maxWidth: "600px", margin: "auto" }}>
      <h1>{worker.name}</h1>
      <p><strong>Profession:</strong> {worker.profession}</p>
      <p><strong>Experience:</strong> {worker.experience}</p>
      <p><strong>Rating:</strong> ⭐ {worker.rating}</p>
      <p><strong>Price per hour:</strong> {worker.price}</p>
      <p><strong>Description:</strong> {worker.description}</p>

      <div style={{ marginTop: "20px" }}>
        <label>
          Booking Date:{" "}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: "5px", marginRight: "10px" }}
          />
        </label>

        <label>
          Booking Time:{" "}
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{ padding: "5px" }}
          />
        </label>
      </div>

      <button
        onClick={handleBooking}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#27ae60",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Book Now
      </button>
    </div>
  );
}

export default WorkerProfile;