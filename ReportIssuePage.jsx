import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIssuesStore } from '../../store/issuesStore.js';
import { MapPin, Upload, AlertCircle } from 'lucide-react';

export const ReportIssuePage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'pothole',
    severity: 'medium',
    latitude: '',
    longitude: '',
    address: '',
    image: null,
  });
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [geoLoading, setGeoLoading] = useState(false);
  const { createIssue, loading, error } = useIssuesStore();
  const navigate = useNavigate();

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          }));
          setGeoLoading(false);
        },
        () => {
          setGeoLoading(false);
          alert('Unable to get your location. Please enter manually.');
        }
      );
    }
  }, []);

  const categories = [
    { value: 'pothole', label: '🚗 Pothole' },
    { value: 'traffic_light', label: '🚦 Traffic Light' },
    { value: 'street_light', label: '💡 Street Light' },
    { value: 'water', label: '💧 Water Leak' },
    { value: 'garbage', label: '🗑️ Garbage' },
    { value: 'other', label: '❓ Other' },
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (event) => setPreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (formData.description.length < 10)
      newErrors.description = 'Description must be at least 10 characters';
    if (!formData.latitude || !formData.longitude) newErrors.location = 'Location is required';
    if (!formData.image) newErrors.image = 'Image is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createIssue(formData);
      navigate('/');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container-max">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-2">Report an Issue</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Help improve our city by reporting infrastructure issues
            </p>

            {error && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-lg flex gap-2">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-base"
                  placeholder="Brief description of the issue"
                  required
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-base h-24 resize-none"
                  placeholder="Detailed description of the issue"
                  required
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              {/* Category and Severity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-base"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Severity *</label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    className="input-base"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="inline mr-2" size={16} />
                  Location *
                </label>
                {geoLoading && <p className="text-sm text-blue-600">Getting your location...</p>}
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="Latitude"
                    className="input-base"
                    step="0.0001"
                    required
                  />
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="Longitude"
                    className="input-base"
                    step="0.0001"
                    required
                  />
                </div>
                {errors.location && (
                  <p className="text-red-600 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-base"
                  placeholder="Street address (optional)"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Upload className="inline mr-2" size={16} />
                  Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  {preview ? (
                    <div className="space-y-4">
                      <img src={preview} alt="Preview" className="h-48 mx-auto rounded-lg" />
                      <label className="btn-secondary inline-block cursor-pointer">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="text-4xl mb-2">📸</div>
                      <p className="font-medium">Click to upload image</p>
                      <p className="text-sm text-gray-500">or drag and drop</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {errors.image && (
                  <p className="text-red-600 text-sm mt-1">{errors.image}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Submitting...' : 'Report Issue'}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportIssuePage;
