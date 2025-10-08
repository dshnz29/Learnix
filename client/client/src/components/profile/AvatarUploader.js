import React, { useState } from 'react';
import { storage } from '../../../lib/firebase'; // Adjust the import based on your firebase setup
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AvatarUploader = ({ currentUser, onAvatarChange }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    const storageRef = ref(storage, `avatars/${currentUser.uid}/${file.name}`);

    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      onAvatarChange(downloadURL); // Call the parent function to update the avatar URL
      setFile(null);
    } catch (err) {
      setError('Error uploading file: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="avatar-uploader">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Avatar'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default AvatarUploader;