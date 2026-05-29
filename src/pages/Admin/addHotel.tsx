import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function AddHotel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    rating: '0',
    amenities: [] as string[],
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const amenitiesList = ['WiFi', 'Parking', 'Pool', 'Restaurant', 'Gym', 'Spa', 'Airport Shuttle'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024;
      
      if (!isValidType) {
        alert(`${file.name} is not a valid image type. Use JPEG, PNG, or WEBP.`);
      }
      if (!isValidSize) {
        alert(`${file.name} is too large. Max 5MB allowed.`);
      }
      
      return isValidType && isValidSize;
    });
    
    setImages(validFiles);
    const previewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const toggleAmenity = (amenity: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      alert('Please upload at least one hotel image');
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('address', form.location);
    formData.append('city', form.location.split(',')[0] || '');
    formData.append('country', form.location.split(',')[1] || '');
    formData.append('rating', form.rating);
    formData.append('amenities', JSON.stringify(form.amenities));
    
    images.forEach(image => {
      formData.append('images', image);
    });

    try {
      const response = await api.post('/hotels/public', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });
      
      console.log('Hotel created:', response.data);
      alert(`✓ Hotel "${form.name}" added successfully!`);
      navigate('/admin/hotels');
    } catch (error: any) {
      console.error('Error adding hotel:', error);
      alert(error.response?.data?.message || 'Failed to add hotel');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="add-hotel-container">
      <h1>Add New Hotel</h1>
      
      <form onSubmit={handleSubmit} className="hotel-form">
        <div className="form-group">
          <label>Hotel Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Enter hotel name"
          />
        </div>

        <div className="form-group">
          <label>Location * (City, Country)</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g., New York, USA"
            required
          />
          <small className="form-hint">Format: City, Country (e.g., Dubai, UAE)</small>
        </div>

        <div className="form-group">
          <label>Rating</label>
          <div className="rating-input">
            <select
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            >
              <option value="0">Select Rating</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            required
            placeholder="Describe the hotel, its features, and what makes it special..."
          />
        </div>

        <div className="form-group">
          <label>Amenities</label>
          <div className="amenities-grid">
            {amenitiesList.map(amenity => (
              <label key={amenity} className="amenity-checkbox">
                <input
                  type="checkbox"
                  checked={form.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Hotel Images * (Max 10 images, up to 5MB each)</label>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={handleImageChange}
            className="file-input"
            required
          />
          <small className="form-hint">
            Recommended: Upload at least 3-5 high-quality images showing different areas of the hotel
          </small>
          
          {previews.length > 0 && (
            <div className="image-previews">
              <p>{previews.length} image(s) selected</p>
              <div className="preview-grid">
                {previews.map((preview, index) => (
                  <div key={index} className="preview-item">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button 
                      type="button" 
                      className="remove-image"
                      onClick={() => removeImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
            <span>{uploadProgress}% uploaded</span>
          </div>
        )}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Adding Hotel...' : 'Add Hotel'}
        </button>
      </form>
    </div>
  );
}