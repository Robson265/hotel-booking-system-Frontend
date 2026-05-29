import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function ManageHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await api.get('/hotels');
      setHotels(response.data);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHotel = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      await api.delete(`/hotels/${id}`);
      fetchHotels();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="manage-hotels">
      <div className="header">
        <h1>Manage Hotels</h1>
        <Link to="/admin/hotels/add" className="btn-primary">Add New Hotel</Link>
      </div>

      <div className="hotels-grid">
        {hotels.map((hotel: any) => (
          <div key={hotel.id} className="hotel-card">
            <img src={hotel.images[0] || '/placeholder.jpg'} alt={hotel.name} />
            <div className="hotel-info">
              <h3>{hotel.name}</h3>
              <p>{hotel.location}</p>
              <div className="rating">⭐ {hotel.rating || 'New'}</div>
              <div className="actions">
                <Link to={`/admin/hotels/edit/${hotel.id}`}>Edit</Link>
                <button onClick={() => deleteHotel(hotel.id)}>Delete</button>
                <Link to={`/hotels/${hotel.id}`}>View</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}