// Simple vanilla JS for SPA-like behavior
// For production, use React or Vue for better state management
const API_BASE = '/api'; // Use relative path since we're serving from same container
let token = localStorage.getItem('token');
let refreshInterval;

function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="max-w-md mx-auto bg-white p-8 rounded shadow">
      <h1 class="text-3xl font-bold text-center mb-2">Majic-Photo.com</h1>
      <p class="text-gray-600 text-center mb-6">AI-Powered Real Estate Photo Enhancement</p>
      <h2 class="text-2xl mb-4">Login</h2>
      <form id="loginForm">
        <input type="email" id="email" placeholder="Email" class="w-full mb-2 p-2 border" required>
        <input type="password" id="password" placeholder="Password" class="w-full mb-2 p-2 border" required>
        <button type="submit" class="bg-blue-500 text-white p-2 w-full">Login</button>
      </form>
      <p class="mt-2">New user? <a href="#" id="registerLink">Register</a></p>
    </div>
  `;
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerLink').addEventListener('click', renderRegister);
}

function renderRegister() {
  document.getElementById('app').innerHTML = `
    <div class="max-w-md mx-auto bg-white p-8 rounded shadow">
      <h1 class="text-3xl font-bold text-center mb-2">Majic-Photo.com</h1>
      <p class="text-gray-600 text-center mb-6">AI-Powered Real Estate Photo Enhancement</p>
      <h2 class="text-2xl mb-4">Register</h2>
      <form id="registerForm">
        <input type="email" id="email" placeholder="Email" class="w-full mb-2 p-2 border" required>
        <input type="password" id="password" placeholder="Password" class="w-full mb-2 p-2 border" required>
        <input type="text" id="company" placeholder="Company" class="w-full mb-2 p-2 border" required>
        <button type="submit" class="bg-blue-500 text-white p-2 w-full">Register</button>
      </form>
      <p class="mt-2">Already have an account? <a href="#" id="loginLink">Login</a></p>
    </div>
  `;
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
  document.getElementById('loginLink').addEventListener('click', renderLogin);
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      token = data.token;
      localStorage.setItem('token', token);
      renderDashboard();
    } else {
      if (document.getElementById('authModal')) {
        closeModal();
      }
      alert(data.msg || 'Login failed. Please try again.');
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('An error occurred during login. Please try again.');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const company = document.getElementById('company').value;
  const registrationCode = document.getElementById('registrationCode').value.trim();
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, company, registrationCode: registrationCode || undefined })
    });
    const data = await res.json();
    if (res.ok) {
      token = data.token;
      localStorage.setItem('token', token);
      renderDashboard();
    } else {
      alert(data.msg || 'Registration failed. Please try again.');
    }
  } catch (err) {
    console.error('Registration error:', err);
    alert('An error occurred during registration. Please try again.');
  }
}

async function renderDashboard() {
  try {
    console.log('Fetching photos with token:', token); // Debug token
    
    // Fetch user info and photos in parallel
    const [photosRes, userRes] = await Promise.all([
      fetch(`${API_BASE}/photos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);
    
    if (!photosRes.ok || !userRes.ok) {
      console.error('Dashboard fetch failed:', photosRes.status, userRes.status);
      localStorage.removeItem('token'); // Clear invalid token
      token = null;
      renderLogin();
      return;
    }
    
    const photos = await photosRes.json();
    const userInfo = await userRes.json();
    console.log('Photos received:', photos.length, photos);
    console.log('User info:', userInfo);
    document.getElementById('app').innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center space-x-3">
          <img src="images/Majic-photo-logo.png" alt="Majic-Photo Logo" class="h-10 w-auto">
          <h2 class="text-2xl font-bold">Majic-Photo.com</h2>
          <div class="ml-6 px-3 py-1 ${userInfo.isUnlimited ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} rounded-full text-sm font-semibold">
            ${userInfo.isUnlimited ? 'Unlimited' : `${userInfo.remainingCredits}/${userInfo.photoCredits} Credits`}
          </div>
        </div>
        <div class="space-x-2">
          <select id="addressFilter" class="border rounded p-2">
            <option value="">All Properties</option>
          </select>
          <select id="roomFilter" class="border rounded p-2">
            <option value="">All Rooms</option>
          </select>
          <a href="/user-guide.html" class="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition text-sm">User Guide</a>
          <a href="/api-docs.html" class="bg-indigo-500 text-white px-3 py-2 rounded hover:bg-indigo-600 transition text-sm">API Docs</a>
          <button id="refresh" class="bg-blue-500 text-white p-2 rounded">Refresh</button>
          <button id="logout" class="bg-red-500 text-white p-2 rounded">Logout</button>
        </div>
      </div>
      <div class="mb-4">
        <div class="bg-gray-50 p-4 rounded mb-4">
          <h3 class="text-lg font-semibold mb-3">Photo Details</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label for="propertyAddress" class="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
              <input 
                type="text" 
                id="propertyAddress" 
                placeholder="123 Main St, Anytown, ST 12345" 
                class="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                list="addressList"
              >
              <datalist id="addressList"></datalist>
            </div>
            <div>
              <label for="roomName" class="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <input 
                type="text" 
                id="roomName" 
                placeholder="Living Room, Kitchen, Master Bedroom..." 
                class="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                list="roomList"
              >
              <datalist id="roomList">
                <option value="Living Room">
                <option value="Kitchen">
                <option value="Master Bedroom">
                <option value="Dining Room">
                <option value="Family Room">
                <option value="Guest Bedroom">
                <option value="Master Bathroom">
                <option value="Guest Bathroom">
                <option value="Home Office">
                <option value="Basement">
                <option value="Garage">
                <option value="Exterior Front">
                <option value="Exterior Back">
                <option value="Patio/Deck">
              </datalist>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <input type="file" id="fileInput" multiple accept="image/jpeg,image/png,image/webp" class="flex-1">
          <button id="uploadBtn" class="bg-green-500 text-white p-3 rounded font-medium hover:bg-green-600">Process with AI</button>
        </div>
      </div>
      ${photos && photos.length > 0 ? generateGroupedPhotosHTML(photos, '', '') : '<div class="text-center py-8 text-gray-500">No photos yet. Upload some photos to get started!</div>'}
    `;
    document.getElementById('logout').addEventListener('click', () => {
      localStorage.removeItem('token');
      token = null;
      if (refreshInterval) clearInterval(refreshInterval);
      renderLogin();
    });
    document.getElementById('refresh').addEventListener('click', renderDashboard);
    document.getElementById('uploadBtn').addEventListener('click', handleUpload);
    
    // Add filter event listeners
    document.getElementById('addressFilter').addEventListener('change', applyFilters);
    document.getElementById('roomFilter').addEventListener('change', applyFilters);
    
    // Load existing addresses for autocomplete and filters
    loadAddressAutocomplete();
    loadFilters(photos);
    
    // Auto-refresh every 10 seconds to check for processing updates, but only if there are processing photos
    if (refreshInterval) clearInterval(refreshInterval);
    const hasProcessingPhotos = photos.some(photo => photo.status === 'processing');
    if (hasProcessingPhotos) {
      refreshInterval = setInterval(() => {
        if (token && document.getElementById('app').innerHTML.includes('Dashboard')) {
          renderDashboard();
        }
      }, 10000);
    }
  } catch (err) {
    console.error('Dashboard error:', err);
    localStorage.removeItem('token'); // Clear invalid token
    token = null;
    renderLogin();
  }
}

async function handleUpload() {
  const fileInput = document.getElementById('fileInput');
  const propertyAddressInput = document.getElementById('propertyAddress');
  const roomNameInput = document.getElementById('roomName');
  const files = fileInput.files;
  
  if (files.length === 0) {
    alert('Please select at least one file to upload.');
    return;
  }
  
  // Get address and room values
  const propertyAddress = propertyAddressInput.value.trim();
  const roomName = roomNameInput.value.trim();
  
  // Show processing progress
  const uploadBtn = document.getElementById('uploadBtn');
  const originalText = uploadBtn.textContent;
  uploadBtn.textContent = 'Processing...';
  uploadBtn.disabled = true;
  
  console.log(`Uploading ${files.length} files with tags:`, { propertyAddress, roomName });
  
  const formData = new FormData();
  for (const file of files) {
    console.log(`Adding file: ${file.name}, size: ${file.size}, type: ${file.type}`);
    formData.append('photos', file);
  }
  
  // Add tagging information
  if (propertyAddress) {
    formData.append('propertyAddress', propertyAddress);
  }
  if (roomName) {
    formData.append('roomName', roomName);
  }
  
  try {
    console.log('Making AI processing request to:', `${API_BASE}/photos/process`);
    console.log('Using token:', token?.substring(0, 50) + '...');
    
    const res = await fetch(`${API_BASE}/photos/process`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    console.log('Upload response status:', res.status);
    
    if (res.ok) {
      const data = await res.json();
      console.log('AI processing started:', data);
      
      // Clear the form inputs
      fileInput.value = '';
      propertyAddressInput.value = '';
      roomNameInput.value = '';
      
      // Refresh dashboard immediately, then set up refresh for processing
      await renderDashboard();
      
      // Show success message from server
      alert(data.msg || `Successfully submitted ${files.length} photo(s) for AI processing!`);
    } else {
      const errorText = await res.text();
      console.error('Upload failed:', res.status, res.statusText, errorText);
      
      // Try to parse as JSON for better error message
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { msg: errorText };
      }
      
      alert(errorData.msg || `Upload failed: ${res.status} ${res.statusText}`);
    }
  } catch (err) {
    console.error('Processing error:', err);
    alert(`Processing error: ${err.message}. Please check your connection and try again.`);
  } finally {
    // Reset button
    uploadBtn.textContent = originalText;
    uploadBtn.disabled = false;
  }
}

async function showStats() {
  try {
    const res = await fetch(`${API_BASE}/photos/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      const stats = await res.json();
      alert(`📊 Processing Statistics:
      
📸 Total Photos: ${stats.totalPhotos}
✅ Completed: ${stats.completedPhotos}
⏳ Processing: ${stats.processingPhotos}  
⏸️ Pending: ${stats.pendingPhotos}
❌ Errors: ${stats.errorPhotos}
🔄 Duplicates Saved: ${stats.duplicatesDetected}

💰 API Calls Made: ${stats.totalApiCalls}
💵 Estimated Cost: $${(stats.totalApiCalls * 0.02).toFixed(2)}
💸 Cost Saved by Duplicates: $${(stats.duplicatesDetected * 0.02).toFixed(2)}`);
    } else {
      alert('Failed to fetch statistics');
    }
  } catch (err) {
    console.error('Stats error:', err);
    alert('Error fetching statistics');
  }
}

function generateGroupedPhotosHTML(photos, addressFilter = '', roomFilter = '') {
  // Filter photos first
  let filteredPhotos = photos;
  if (addressFilter) {
    filteredPhotos = filteredPhotos.filter(photo => 
      photo.propertyAddress === addressFilter || 
      (!photo.propertyAddress && addressFilter === 'Untagged Properties')
    );
  }
  if (roomFilter) {
    filteredPhotos = filteredPhotos.filter(photo => 
      photo.roomName === roomFilter || 
      (!photo.roomName && roomFilter === 'Untagged Rooms')
    );
  }
  
  if (filteredPhotos.length === 0) {
    return '<div class="text-center py-8 text-gray-500">No photos match the current filters.</div>';
  }
  
  // Group filtered photos by address, then by room
  const grouped = {};
  
  filteredPhotos.forEach(photo => {
    const address = photo.propertyAddress || 'Untagged Properties';
    const room = photo.roomName || 'Untagged Rooms';
    
    if (!grouped[address]) {
      grouped[address] = {};
    }
    if (!grouped[address][room]) {
      grouped[address][room] = [];
    }
    grouped[address][room].push(photo);
  });
  
  // Generate HTML for each address group
  const addressGroups = Object.keys(grouped).sort().map(address => {
    const rooms = grouped[address];
    const roomGroups = Object.keys(rooms).sort().map(room => {
      const roomPhotos = rooms[room];
      const photoCards = roomPhotos.map(photo => {
        const fileName = photo.originalPath ? photo.originalPath.split('/').pop() : 'Unknown';
        const status = photo.status || 'pending';
        
        return `
          <div class="bg-white p-3 rounded shadow">
            <h4 class="text-xs font-medium mb-2 truncate text-gray-600">${fileName}</h4>
            <div class="space-y-2">
              ${photo.originalUrl ? `
                <div>
                  <p class="text-xs text-gray-500">Original:</p>
                  <img src="${photo.originalUrl}" alt="Original" class="w-full h-32 object-cover rounded" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/><text fill=%22%23999%22 font-size=%2216%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22>Loading...</text></svg>'">
                </div>
              ` : ''}
              ${photo.enhancedUrl ? `
                <div>
                  <p class="text-xs text-gray-500">Enhanced:</p>
                  <img src="${photo.enhancedUrl}" alt="Enhanced" class="w-full h-32 object-cover rounded" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/><text fill=%22%23999%22 font-size=%2216%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22>Processing...</text></svg>'">
                </div>
              ` : `
                <div class="bg-gray-100 rounded p-2 text-center">
                  <p class="text-xs text-gray-600">${status}</p>
                  ${status === 'processing' ? '<p class="text-xs">Processing...</p>' : ''}
                  ${status === 'error' ? '<p class="text-xs text-red-500">Failed</p>' : ''}
                </div>
              `}
            </div>
            <div class="mt-2 space-x-1">
              ${photo.originalUrl ? `
                <a href="${photo.originalUrl}" target="_blank" class="text-blue-500 text-xs">Original</a>
              ` : ''}
              ${photo.enhancedUrl ? `
                <a href="${photo.enhancedUrl}" target="_blank" class="text-green-500 text-xs">Enhanced</a>
              ` : ''}
              ${photo.enhancedUrl ? `
                <button onclick="showReprocessModal('${photo._id}')" class="text-purple-500 text-xs hover:underline">Reprocess</button>
              ` : ''}
              <!-- DEBUG: Status: ${photo.status}, HasEnhanced: ${!!photo.enhancedUrl} -->
            </div>
          </div>
        `;
      }).join('');
      
      return `
        <div class="mb-4">
          <h3 class="text-md font-semibold text-gray-700 mb-2 flex items-center">
            <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">${room}</span>
            <span class="ml-2 text-sm text-gray-500">(${roomPhotos.length} photos)</span>
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            ${photoCards}
          </div>
        </div>
      `;
    }).join('');
    
    return `
      <div class="mb-6 bg-gray-50 p-4 rounded-lg">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <span class="bg-green-100 text-green-800 px-3 py-1 rounded">${address}</span>
          <span class="ml-2 text-sm text-gray-500">(${Object.values(rooms).flat().length} photos total)</span>
        </h2>
        ${roomGroups}
      </div>
    `;
  }).join('');
  
  return addressGroups;
}

async function loadAddressAutocomplete() {
  try {
    const res = await fetch(`${API_BASE}/photos/addresses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      const addresses = await res.json();
      const datalist = document.getElementById('addressList');
      if (datalist) {
        datalist.innerHTML = '';
        addresses.forEach(address => {
          const option = document.createElement('option');
          option.value = address;
          datalist.appendChild(option);
        });
      }
    }
  } catch (err) {
    console.error('Error loading addresses:', err);
  }
}

function loadFilters(photos) {
  const addressFilter = document.getElementById('addressFilter');
  const roomFilter = document.getElementById('roomFilter');
  
  if (addressFilter && roomFilter && photos) {
    // Get unique addresses
    const addresses = [...new Set(photos.map(photo => photo.propertyAddress || 'Untagged Properties'))].sort();
    addressFilter.innerHTML = '<option value="">All Properties</option>';
    addresses.forEach(address => {
      const option = document.createElement('option');
      option.value = address;
      option.textContent = address;
      addressFilter.appendChild(option);
    });
    
    // Get unique rooms  
    const rooms = [...new Set(photos.map(photo => photo.roomName || 'Untagged Rooms'))].sort();
    roomFilter.innerHTML = '<option value="">All Rooms</option>';
    rooms.forEach(room => {
      const option = document.createElement('option');
      option.value = room;
      option.textContent = room;
      roomFilter.appendChild(option);
    });
  }
}

async function applyFilters() {
  const addressFilter = document.getElementById('addressFilter').value;
  const roomFilter = document.getElementById('roomFilter').value;
  
  try {
    // Re-fetch photos to get latest data
    const res = await fetch(`${API_BASE}/photos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      const photos = await res.json();
      
      // Find the photo container and update it
      const photoContainer = document.querySelector('#app').children[1]; // Second child after header
      if (photoContainer) {
        const filteredHTML = photos && photos.length > 0 ? 
          generateGroupedPhotosHTML(photos, addressFilter, roomFilter) : 
          '<div class="text-center py-8 text-gray-500">No photos yet. Upload some photos to get started!</div>';
        
        // Replace the photo container content
        photoContainer.outerHTML = filteredHTML;
      }
    }
  } catch (err) {
    console.error('Error applying filters:', err);
  }
}

function showReprocessModal(photoId) {
  // Create modal HTML
  const modal = document.createElement('div');
  modal.id = 'reprocessModal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
      <h3 class="text-xl font-bold mb-4">Reprocess with Custom Prompt</h3>
      <p class="text-gray-600 mb-4">Choose which version to reprocess and enter your custom prompt:</p>
      
      <!-- Source Image Selection -->
      <div class="mb-4">
        <p class="text-sm font-medium text-gray-700 mb-2">Start with which image?</p>
        <div class="flex space-x-4">
          <label class="flex items-center">
            <input type="radio" name="sourceImage" value="original" checked class="mr-2">
            <span class="text-sm">Original (start fresh)</span>
          </label>
          <label class="flex items-center">
            <input type="radio" name="sourceImage" value="enhanced" class="mr-2">
            <span class="text-sm">Enhanced (refine existing)</span>
          </label>
        </div>
        <p class="text-xs text-gray-500 mt-1">Original = start over completely, Enhanced = make adjustments to current staging</p>
      </div>

      <textarea 
        id="customPrompt" 
        placeholder="Example: Style this kitchen as a modern farmhouse with warm lighting and rustic decor..."
        rows="4"
        class="w-full p-3 border rounded-lg focus:border-purple-500 focus:outline-none mb-4"
      ></textarea>
      <div class="flex space-x-3">
        <button onclick="processReprocess('${photoId}')" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
          Reprocess ($0.50)
        </button>
        <button onclick="closeReprocessModal()" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition">
          Cancel
        </button>
      </div>
      <p class="text-xs text-gray-500 mt-2">This will create a new enhanced version and charge for one additional API call.</p>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Focus on textarea
  setTimeout(() => {
    document.getElementById('customPrompt').focus();
  }, 100);
}

function closeReprocessModal() {
  const modal = document.getElementById('reprocessModal');
  if (modal) {
    modal.remove();
  }
}

async function processReprocess(photoId) {
  const customPrompt = document.getElementById('customPrompt').value.trim();
  const sourceImage = document.querySelector('input[name="sourceImage"]:checked')?.value || 'enhanced';
  
  if (!customPrompt) {
    alert('Please enter a custom prompt for reprocessing.');
    return;
  }
  
  // Show loading state
  const button = document.querySelector('#reprocessModal button');
  const originalText = button.textContent;
  button.textContent = 'Processing...';
  button.disabled = true;
  
  try {
    const res = await fetch(`${API_BASE}/photos/reprocess/${photoId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ customPrompt, sourceImage })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      closeReprocessModal();
      alert('Photo reprocessing started! It will appear shortly.');
      
      // Refresh dashboard to show processing status
      renderDashboard();
    } else {
      alert(data.msg || 'Reprocessing failed. Please try again.');
      button.textContent = originalText;
      button.disabled = false;
    }
  } catch (err) {
    console.error('Reprocess error:', err);
    alert('An error occurred during reprocessing. Please try again.');
    button.textContent = originalText;
    button.disabled = false;
  }
}

function share(url) {
  // Simple share; use navigator.share if available
  if (navigator.share) {
    navigator.share({ url });
  } else {
    prompt('Copy this link:', url);
  }
}

// Initial render
if (token) {
  renderDashboard();
} else {
  renderLanding(); // Show landing page instead of login
}