'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

const NewOrgModal = ({ openModal, setOpenModal, onSaveCustomer }) => {
  const [logoFile, setLogoFile] = useState(null);
  const [orgData, setOrgData] = useState({
    name: '',
    logoUrl: '',
    orgId: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    },
    phone: '',
    website: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setOrgData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setOrgData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const uploadImageToImgBB = async (imageFile) => {
    const API_KEY = process.env.NEXT_PUBLIC_IMGBB_KEY;
    const url = `https://api.imgbb.com/1/upload?key=${API_KEY}`;

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.status === 200) {
        return data.data.url;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleLogoUpload = async () => {
    const file = logoFile?.target?.files[0];
    if (file) {
      try {
        const imageUrl = await uploadImageToImgBB(file);
        setOrgData((prev) => ({ ...prev, logoUrl: imageUrl }));

      } catch (error) {
        toast.error('Image upload failed');
      }
    } else {
      toast.error('No file selected');
    }
  };

  const checkOrgIdAvailability = async (id) => {
    const res = await fetch(`/api/gets/check-org-id-availability?id=${id}`, {
      credentials: "include"
    })
    const data = await res.json()
    return data?.isAvailable || false;
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const idAvailable = await checkOrgIdAvailability(orgData.orgId);
      if (!idAvailable) {
        return toast.error("org id is not available.")
      }
      const res = await fetch("/api/updates/new-org", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orgData),
        credentials: 'include'
      })
      const data = await res.json();
      if (data.status === 200) {
        toast.success('Organization saved successfully!');
      } else {
        toast.error(data?.message)
      }
      setOpenModal(false);
      window?.location?.reload()
    } catch (error) {
      toast.error('Failed to save organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex items-center justify-center">
      <div onClick={() => setOpenModal(false)} className={`fixed z-[100] flex items-center justify-center ${openModal ? 'opacity-1 visible' : 'invisible opacity-0'} inset-0 h-full w-full bg-black/20 backdrop-blur-sm duration-100`}>
        <div onClick={(e_) => e_.stopPropagation()} className={`absolute md:w-[90%] w-full h-[80%] overflow-y-auto rounded-lg bg-white dark:bg-gray-900 drop-shadow-2xl ${openModal ? 'opacity-1 translate-y-0 duration-300' : '-translate-y-20 opacity-0 duration-150'}`}>
          <form onSubmit={handleSubmit} className="p-8">
            <h2 className="font-semibold mb-4">Add New Organization</h2>
            <div className="input-container mb-4">
              <label className="font-semibold mr-2 w-32">Organization Name:</label>
              <input
                type="text"
                required
                name="name"
                value={orgData.name}
                onChange={handleChange}
                className="text-input"
              />
            </div>
            <div className="input-container mb-4">
              <label className="font-semibold mr-2 w-32">Organization Id:</label>
              <input
                type="text"
                required
                name="orgId"
                value={orgData.orgId}
                onChange={handleChange}
                className="text-input"
              />
            </div>
            <div className="input-container mb-4">
              <label className="font-semibold mr-2 w-32">Logo Upload:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e)}
                className="mt-1 block w-full"
              />

            </div>
            <button onClick={handleLogoUpload} type='button' className='btn-submit'>Start Upload</button>
            <h3 className="font-semibold mb-2">Address</h3>
            <div className="input-container mb-4">
              <label className="font-semibold mr-2 w-32">Street:</label>
              <input
                type="text"
                required
                name="address.street"
                value={orgData.address.street}
                onChange={handleChange}
                className="text-input"
              />
            </div>
            <div className="input-container mb-4">
              <label className="font-semibold mr-2 w-32">City:</label>
              <input
                type="text"
                required
                name="address.city"
                value={orgData.address.city}
                onChange={handleChange}
                className="text-input"
              />
            </div>
            <div className="input-container mb-4">
              <label className="font-semibold mr-2 w-32">State:</label>
              <input
                type="text"
                name="address.state"
                value={orgData.address.state}
                onChange={handleChange}
                className="text-input"
              />
            </div>
            <div className="input-container mb-4">
              <label className="font-semibold mr-2 w-32">Country:</label>
              <input
                type="text"
                required
                name="address.country"
                value={orgData.address.country}
                onChange={handleChange}
                className="text-input"
              />
            </div>
            <div className="input-container mb-4">
              <label className="font-semibold mr-2 w-32">Postal Code:</label>
              <input
                type="text"
                required
                name="address.postalCode"
                value={orgData.address.postalCode}
                onChange={handleChange}
                className="text-input"
              />
            </div>
            <div className="input-container mb-4">
              <label className="font-semibold mr-2 w-32">Phone:</label>
              <input
                type="text"
                required
                name="phone"
                value={orgData.phone}
                onChange={handleChange}
                className="text-input"
              />
            </div>
            <div className="input-container mb-4">
              <label className="font-semibold mr-2 w-32">Website:</label>
              <input
                type="url"
                name="website"
                value={orgData.website}
                onChange={handleChange}
                className="text-input"
              />
            </div>
            <div className="input-container mb-4">
              <label className="font-semibold mr-2 w-32">Email:</label>
              <input
                type="email"
                name="email"
                value={orgData.email}
                onChange={handleChange}
                className="text-input"
              />
            </div>
            <button
              type="submit"
              className="w-[200px] p-2 bg-green-500 text-white rounded"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Organization'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewOrgModal;
