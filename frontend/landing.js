// Landing page component
function renderLanding() {
  document.getElementById('app').innerHTML = `
    <!-- Hero Section -->
    <div class="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-green-500">
      <!-- Navigation -->
      <nav class="flex flex-col lg:flex-row lg:justify-between lg:items-center p-6 text-white space-y-4 lg:space-y-0">
        <div class="flex items-center space-x-3">
          <img src="images/Majic-photo-logo.png" alt="Majic-Photo Logo" class="h-10 w-auto">
          <h1 class="text-xl sm:text-2xl font-bold">Majic-Photo.com</h1>
        </div>
        <div class="flex flex-wrap items-center gap-2 sm:gap-4">
          <button onclick="scrollToSection('features')" class="hover:text-purple-200 transition text-sm sm:text-base">Features</button>
          <button onclick="scrollToSection('pricing')" class="hover:text-purple-200 transition text-sm sm:text-base">Pricing</button>
          <button onclick="scrollToSection('how-it-works')" class="hover:text-purple-200 transition text-sm sm:text-base hidden sm:inline">How It Works</button>
          <a href="/user-guide.html" class="hover:text-purple-200 transition text-sm sm:text-base">Guide</a>
          <a href="/api-docs.html" class="hover:text-purple-200 transition text-sm sm:text-base">API</a>
          <button onclick="showLoginModal()" class="bg-white text-purple-600 px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-semibold hover:bg-purple-50 transition text-sm sm:text-base">Login</button>
          <button onclick="showRegisterModal()" class="bg-purple-800 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-semibold hover:bg-purple-900 transition text-sm sm:text-base">Get Started</button>
        </div>
      </nav>

      <!-- Hero Content -->
      <div class="container mx-auto px-6 py-20 text-center text-white">
        <!-- Fixed height container to prevent layout shift -->
        <div class="hero-text-container mb-6">
          <style>
            .hero-text-container {
              min-height: 150px; /* Mobile default */
              display: flex;
              align-items: center;
              justify-content: center;
            }
            @media (min-width: 640px) {
              .hero-text-container { min-height: 180px; }
            }
            @media (min-width: 768px) {
              .hero-text-container { min-height: 210px; }
            }
            @media (min-width: 1024px) {
              .hero-text-container { min-height: 240px; }
            }
            /* Smooth transitions for text elements */
            #hero-line1, #hero-highlight, #hero-line3 {
              transition: opacity 0.5s ease-in-out;
            }
          </style>
          <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
            <span id="hero-line1">Transform Empty Rooms Into</span><br/>
            <span id="hero-highlight" class="text-yellow-300">Stunning Staged Homes</span><br/>
            <span id="hero-line3">In Seconds</span>
          </h2>
        </div>
        <p class="text-xl mb-8 text-purple-100 max-w-3xl mx-auto">
          AI-powered virtual staging that sells homes 73% faster. Upload your photos, and watch as our cutting-edge AI transforms empty spaces into beautifully furnished rooms that buyers can envision as their dream home.
        </p>
        <div class="bg-white/10 backdrop-blur rounded-lg p-4 mb-8 max-w-2xl mx-auto">
          <p class="text-lg font-semibold text-yellow-300 mb-2">🎉 Get Started Free!</p>
          <p class="text-purple-100">10 free photo enhancements • No credit card required • Upgrade anytime</p>
        </div>
        <div class="flex justify-center space-x-4">
          <button onclick="showRegisterModal()" class="bg-yellow-400 text-purple-900 px-8 py-4 rounded-lg text-lg font-bold hover:bg-yellow-300 transform hover:scale-105 transition shadow-lg">
            Start Free - 10 Photos Included
          </button>
          <button onclick="scrollToSection('demo')" class="bg-white/20 backdrop-blur text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white/30 transition">
            See Examples
          </button>
        </div>
        
        <!-- Stats -->
        <div class="grid grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          <div class="bg-white/10 backdrop-blur rounded-lg p-6">
            <div class="text-4xl font-bold text-yellow-300">73%</div>
            <div class="text-sm mt-2">Faster Home Sales</div>
          </div>
          <div class="bg-white/10 backdrop-blur rounded-lg p-6">
            <div class="text-4xl font-bold text-yellow-300">$0.50</div>
            <div class="text-sm mt-2">Per Photo</div>
          </div>
          <div class="bg-white/10 backdrop-blur rounded-lg p-6">
            <div class="text-4xl font-bold text-yellow-300">30 Sec</div>
            <div class="text-sm mt-2">Processing Time</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Demo Section -->
    <div id="demo" class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <h3 class="text-4xl font-bold text-center mb-4">See The Magic In Action</h3>
        <p class="text-center text-gray-600 mb-12 text-lg">Hover over images to see the transformation</p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="group relative overflow-hidden rounded-lg shadow-xl">
            <div class="aspect-video relative">
              <img 
                src="images/before/living_room_b.jpg" 
                alt="Empty Living Room" 
                class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              >
              <img 
                src="images/after/living_room.png" 
                alt="Staged Living Room" 
                class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              >
              <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span class="text-white font-bold text-lg">Beautifully Staged!</span>
              </div>
            </div>
            <div class="p-4 bg-white">
              <h4 class="font-semibold">Living Room</h4>
              <p class="text-sm text-gray-600">Modern contemporary staging</p>
            </div>
          </div>
          
          <div class="group relative overflow-hidden rounded-lg shadow-xl">
            <div class="aspect-video relative">
              <img 
                src="images/before/kitchen_b.jpg" 
                alt="Empty Kitchen" 
                class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              >
              <img 
                src="images/after/kitchen.png" 
                alt="Staged Kitchen" 
                class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              >
              <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span class="text-white font-bold text-lg">Ready to Cook!</span>
              </div>
            </div>
            <div class="p-4 bg-white">
              <h4 class="font-semibold">Kitchen</h4>
              <p class="text-sm text-gray-600">Styled with modern accessories</p>
            </div>
          </div>
          
          <div class="group relative overflow-hidden rounded-lg shadow-xl">
            <div class="aspect-video relative">
              <img 
                src="images/before/primary_b.jpg" 
                alt="Empty Primary Bedroom" 
                class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              >
              <img 
                src="images/after/primary.png" 
                alt="Staged Primary Bedroom" 
                class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              >
              <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span class="text-white font-bold text-lg">Cozy & Inviting!</span>
              </div>
            </div>
            <div class="p-4 bg-white">
              <h4 class="font-semibold">Primary Bedroom</h4>
              <p class="text-sm text-gray-600">Warm and welcoming design</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div id="features" class="py-20 bg-white">
      <div class="container mx-auto px-6">
        <h3 class="text-4xl font-bold text-center mb-4">Powerful Features for Real Estate Professionals</h3>
        <p class="text-center text-gray-600 mb-12 text-lg">Everything you need to showcase properties at their best</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg hover:shadow-lg transition">
            <div class="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h4 class="text-xl font-semibold mb-2">Lightning Fast Processing</h4>
            <p class="text-gray-600">Get professionally staged photos in under 30 seconds. No waiting, no delays.</p>
          </div>
          
          <div class="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg hover:shadow-lg transition">
            <div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
            </div>
            <h4 class="text-xl font-semibold mb-2">Property Organization</h4>
            <p class="text-gray-600">Group photos by property address and room type for easy management.</p>
          </div>
          
          <div class="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg hover:shadow-lg transition">
            <div class="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h4 class="text-xl font-semibold mb-2">Smart AI Staging</h4>
            <p class="text-gray-600">Our AI understands room types and stages appropriately with realistic furniture.</p>
          </div>
          
          <div class="p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg hover:shadow-lg transition">
            <div class="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h4 class="text-xl font-semibold mb-2">Cost Effective</h4>
            <p class="text-gray-600">Save thousands compared to physical staging. Pay only for what you use.</p>
          </div>
          
          <div class="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg hover:shadow-lg transition">
            <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
              </svg>
            </div>
            <h4 class="text-xl font-semibold mb-2">Multiple Style Options</h4>
            <p class="text-gray-600">Choose from modern, traditional, or contemporary staging styles.</p>
          </div>
          
          <div class="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg hover:shadow-lg transition">
            <div class="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <h4 class="text-xl font-semibold mb-2">Buyer Psychology</h4>
            <p class="text-gray-600">Staged homes sell 73% faster and for up to 10% more than empty homes.</p>
          </div>

          <div class="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg hover:shadow-lg transition">
            <div class="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </div>
            <h4 class="text-xl font-semibold mb-2">Custom Reprocessing</h4>
            <p class="text-gray-600">Fine-tune results with custom prompts to get the exact style you want.</p>
          </div>

          <div class="p-6 bg-gradient-to-br from-teal-50 to-green-50 rounded-lg hover:shadow-lg transition">
            <div class="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h4 class="text-xl font-semibold mb-2">Flexible Credits</h4>
            <p class="text-gray-600">Start with 10 free photos. Get unlimited access with registration codes.</p>
          </div>

          <div class="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg hover:shadow-lg transition">
            <div class="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h4 class="text-xl font-semibold mb-2">Room-Aware AI</h4>
            <p class="text-gray-600">AI understands room context - kitchens, bedrooms, living rooms staged appropriately.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- How It Works -->
    <div id="how-it-works" class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <h3 class="text-4xl font-bold text-center mb-4">How It Works</h3>
        <p class="text-center text-gray-600 mb-12 text-lg">Three simple steps to transform your listings</p>
        
        <div class="max-w-4xl mx-auto">
          <div class="flex flex-col md:flex-row items-center mb-12">
            <div class="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 md:mb-0 md:mr-8 flex-shrink-0">
              1
            </div>
            <div class="text-center md:text-left">
              <h4 class="text-2xl font-semibold mb-2">Upload Your Photos</h4>
              <p class="text-gray-600">Simply drag and drop your empty room photos. Support for JPEG, PNG, and WebP formats. Tag them by property address and room type for easy organization.</p>
            </div>
          </div>
          
          <div class="flex flex-col md:flex-row items-center mb-12">
            <div class="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 md:mb-0 md:mr-8 flex-shrink-0">
              2
            </div>
            <div class="text-center md:text-left">
              <h4 class="text-2xl font-semibold mb-2">AI Works Its Magic</h4>
              <p class="text-gray-600">Our advanced AI analyzes the room, understands the space, and virtually stages it with appropriate furniture and decor in under 30 seconds.</p>
            </div>
          </div>
          
          <div class="flex flex-col md:flex-row items-center">
            <div class="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 md:mb-0 md:mr-8 flex-shrink-0">
              3
            </div>
            <div class="text-center md:text-left">
              <h4 class="text-2xl font-semibold mb-2">Download & Share</h4>
              <p class="text-gray-600">Download your professionally staged photos instantly. Share them on MLS, social media, or your website to attract more buyers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pricing Section -->
    <div id="pricing" class="py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
      <div class="container mx-auto px-6">
        <h3 class="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h3>
        <p class="text-center text-purple-100 mb-12 text-lg">Start free, upgrade when you're ready</p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <!-- Free Tier -->
          <div class="bg-white text-gray-800 rounded-lg p-8 hover:shadow-2xl transition transform hover:scale-105">
            <h4 class="text-2xl font-bold mb-4">Free Trial</h4>
            <div class="text-4xl font-bold mb-2">$0</div>
            <div class="text-gray-600 mb-6">10 free photos</div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                No credit card required
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Perfect for testing
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                All features included
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Custom reprocessing
              </li>
            </ul>
            <button onclick="showRegisterModal()" class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
              Get Started
            </button>
          </div>
          
          <!-- Monthly Plan -->
          <div class="bg-gradient-to-br from-yellow-400 to-orange-400 text-gray-800 rounded-lg p-8 shadow-2xl transform scale-105 relative">
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
              MOST POPULAR
            </div>
            <h4 class="text-2xl font-bold mb-4">Professional</h4>
            <div class="text-4xl font-bold mb-2">$49</div>
            <div class="text-gray-700 mb-6">per month</div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <strong>150 photos/month</strong>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                $0.33 per photo
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Priority processing
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Bulk upload tools
              </li>
            </ul>
            <button onclick="showRegisterModal()" class="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition">
              Start Free Trial
            </button>
          </div>
          
          <!-- Registration Code -->
          <div class="bg-white text-gray-800 rounded-lg p-8 hover:shadow-2xl transition transform hover:scale-105">
            <h4 class="text-2xl font-bold mb-4">Unlimited Access</h4>
            <div class="text-4xl font-bold mb-2">Registration</div>
            <div class="text-gray-600 mb-6">Code Required</div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <strong>Unlimited photos</strong>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                No monthly fees
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                All premium features
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                32-char hex code
              </li>
            </ul>
            <button onclick="showRegisterModal()" class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
              Register with Code
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Testimonials -->
    <div class="py-20 bg-white">
      <div class="container mx-auto px-6">
        <h3 class="text-4xl font-bold text-center mb-12">What Real Estate Professionals Say</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div class="bg-gray-50 p-6 rounded-lg">
            <div class="flex mb-4">
              ${[...Array(5)].map(() => '<span class="text-yellow-400">★</span>').join('')}
            </div>
            <p class="text-gray-600 mb-4">"This tool has transformed my business. I can now show potential in every property, and my listings get 3x more views!"</p>
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-600 rounded-full mr-3"></div>
              <div>
                <div class="font-semibold">Sarah Johnson</div>
                <div class="text-sm text-gray-500">Real Estate Agent</div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 p-6 rounded-lg">
            <div class="flex mb-4">
              ${[...Array(5)].map(() => '<span class="text-yellow-400">★</span>').join('')}
            </div>
            <p class="text-gray-600 mb-4">"We've saved thousands on staging costs. The AI is incredibly smart and the results look absolutely professional."</p>
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-600 rounded-full mr-3"></div>
              <div>
                <div class="font-semibold">Michael Chen</div>
                <div class="text-sm text-gray-500">Property Developer</div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 p-6 rounded-lg">
            <div class="flex mb-4">
              ${[...Array(5)].map(() => '<span class="text-yellow-400">★</span>').join('')}
            </div>
            <p class="text-gray-600 mb-4">"My staged listings sell 2x faster. Buyers can finally visualize themselves in the space. Game changer!"</p>
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-600 rounded-full mr-3"></div>
              <div>
                <div class="font-semibold">Emily Rodriguez</div>
                <div class="text-sm text-gray-500">Broker</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      <div class="container mx-auto px-6 text-center">
        <h3 class="text-4xl font-bold mb-4">Ready to Transform Your Listings?</h3>
        <p class="text-xl mb-8 text-purple-100">Join thousands of real estate professionals using AI to sell homes faster</p>
        <button onclick="showRegisterModal()" class="bg-yellow-400 text-purple-900 px-8 py-4 rounded-lg text-lg font-bold hover:bg-yellow-300 transform hover:scale-105 transition shadow-lg">
          Start Free - 10 Photos Included
        </button>
        <p class="mt-4 text-sm text-purple-200">No credit card required • Custom reprocessing • Registration codes for unlimited access</p>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8">
      <div class="container mx-auto px-6">
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div class="text-center lg:text-left">
            <div class="flex items-center justify-center lg:justify-start space-x-2 mb-2">
              <img src="images/Majic-photo-logo.png" alt="Majic-Photo Logo" class="h-8 w-auto">
              <div class="text-xl font-bold">Majic-Photo.com</div>
            </div>
            <div class="text-gray-400">© 2025 All rights reserved</div>
          </div>
          <div class="flex flex-wrap justify-center lg:justify-end gap-2 sm:gap-4 lg:gap-6 text-sm sm:text-base">
            <a href="/user-guide.html" class="hover:text-purple-400 transition">Guide</a>
            <a href="/api-docs.html" class="hover:text-purple-400 transition">API</a>
            <a href="/privacy.html" class="hover:text-purple-400 transition">Privacy</a>
            <a href="/terms.html" class="hover:text-purple-400 transition">Terms</a>
            <a href="mailto:support@majic-photo.com" class="hover:text-purple-400 transition">Contact</a>
          </div>
        </div>
      </div>
    </footer>

    <!-- Login/Register Modal -->
    <div id="authModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div id="authContent">
          <!-- Content will be inserted here -->
        </div>
      </div>
    </div>
  `;

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 1s ease-out;
    }
  `;
  document.head.appendChild(style);
}

// Modal functions
function showLoginModal() {
  const modal = document.getElementById('authModal');
  const content = document.getElementById('authContent');
  
  content.innerHTML = `
    <h2 class="text-2xl font-bold mb-4">Welcome Back!</h2>
    <form id="loginForm">
      <input type="email" id="email" placeholder="Email" class="w-full mb-3 p-3 border rounded-lg focus:border-purple-500 focus:outline-none" required>
      <input type="password" id="password" placeholder="Password" class="w-full mb-3 p-3 border rounded-lg focus:border-purple-500 focus:outline-none" required>
      <button type="submit" class="bg-purple-600 text-white p-3 w-full rounded-lg font-semibold hover:bg-purple-700 transition">Login</button>
    </form>
    
    <div class="my-4 flex items-center">
      <hr class="flex-1 border-gray-300">
      <span class="px-3 text-gray-500 text-sm">or</span>
      <hr class="flex-1 border-gray-300">
    </div>
    
    <button onclick="loginWithGoogle()" class="bg-white border border-gray-300 text-gray-700 p-3 w-full rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center space-x-2">
      <svg class="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>Continue with Google</span>
    </button>
    
    <p class="mt-4 text-center">
      Don't have an account? 
      <a href="#" onclick="showRegisterModal(); return false;" class="text-purple-600 hover:underline">Register</a>
    </p>
    <button onclick="closeModal()" class="mt-4 text-gray-500 hover:text-gray-700 w-full">Cancel</button>
  `;
  
  modal.classList.remove('hidden');
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

function showRegisterModal() {
  const modal = document.getElementById('authModal');
  const content = document.getElementById('authContent');
  
  content.innerHTML = `
    <h2 class="text-2xl font-bold mb-4">Start Your Free Trial</h2>
    <p class="text-gray-600 mb-4">Get 10 free photos to test our service!</p>
    <form id="registerForm">
      <input type="email" id="email" placeholder="Email" class="w-full mb-3 p-3 border rounded-lg focus:border-purple-500 focus:outline-none" required>
      <input type="password" id="password" placeholder="Password" class="w-full mb-3 p-3 border rounded-lg focus:border-purple-500 focus:outline-none" required>
      <input type="text" id="company" placeholder="Company (Optional)" class="w-full mb-3 p-3 border rounded-lg focus:border-purple-500 focus:outline-none">
      <input type="text" id="registrationCode" placeholder="Registration Code (Optional)" class="w-full mb-3 p-3 border rounded-lg focus:border-purple-500 focus:outline-none" maxlength="32">
      <div class="text-xs text-gray-500 mb-3">Registration code grants unlimited photo enhancements. Leave blank for 10 free photos.</div>
      <button type="submit" class="bg-purple-600 text-white p-3 w-full rounded-lg font-semibold hover:bg-purple-700 transition">Create Account</button>
    </form>
    
    <div class="my-4 flex items-center">
      <hr class="flex-1 border-gray-300">
      <span class="px-3 text-gray-500 text-sm">or</span>
      <hr class="flex-1 border-gray-300">
    </div>
    
    <button onclick="registerWithGoogle()" class="bg-white border border-gray-300 text-gray-700 p-3 w-full rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center space-x-2">
      <svg class="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>Sign up with Google</span>
    </button>
    
    <p class="mt-4 text-center">
      Already have an account? 
      <a href="#" onclick="showLoginModal(); return false;" class="text-purple-600 hover:underline">Login</a>
    </p>
    <button onclick="closeModal()" class="mt-4 text-gray-500 hover:text-gray-700 w-full">Cancel</button>
  `;
  
  modal.classList.remove('hidden');
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

function closeModal() {
  document.getElementById('authModal').classList.add('hidden');
}

function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

function loginWithGoogle() {
  window.location.href = '/api/auth/google';
}

function registerWithGoogle() {
  window.location.href = '/api/auth/google';
}

// Handle Google OAuth callback
function handleGoogleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const error = urlParams.get('error');
  const auth = urlParams.get('auth');
  
  if (error) {
    alert('Authentication failed. Please try again.');
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }
  
  if (token && auth === 'google') {
    localStorage.setItem('token', token);
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
    // Redirect to app
    window.location.href = '/app.html';
  }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
  const modal = document.getElementById('authModal');
  if (event.target === modal) {
    closeModal();
  }
});

// Hero text rotation functionality
function initHeroTextRotation() {
  const heroTexts = [
    {
      line1: "Transform Empty Rooms Into",
      highlight: "Stunning Staged Homes",
      line3: "In Seconds"
    },
    {
      line1: "Transform Cluttered Rooms Into",
      highlight: "Stunning Clean Spaces",
      line3: "In Seconds"
    },
    {
      line1: "Transform Outdoor Home Photos Into",
      highlight: "Stunning DSLR Professional Photos",
      line3: "In Seconds"
    }
  ];
  
  let currentIndex = 0;
  let rotationInterval;
  let isPaused = false;
  
  function updateHeroText() {
    const line1 = document.getElementById('hero-line1');
    const highlight = document.getElementById('hero-highlight');
    const line3 = document.getElementById('hero-line3');
    
    if (!line1 || !highlight || !line3) return;
    
    // Fade out
    line1.style.opacity = '0';
    highlight.style.opacity = '0';
    line3.style.opacity = '0';
    
    // Update text after fade out
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % heroTexts.length;
      const nextText = heroTexts[currentIndex];
      
      line1.textContent = nextText.line1;
      highlight.textContent = nextText.highlight;
      line3.textContent = nextText.line3;
      
      // Fade in
      setTimeout(() => {
        line1.style.opacity = '1';
        highlight.style.opacity = '1';
        line3.style.opacity = '1';
      }, 50);
    }, 500);
  }
  
  // Start rotation
  function startRotation() {
    if (!isPaused) {
      rotationInterval = setInterval(updateHeroText, 4000);
    }
  }
  
  // Pause rotation on hover
  const heroContainer = document.querySelector('.hero-text-container');
  if (heroContainer) {
    heroContainer.addEventListener('mouseenter', () => {
      isPaused = true;
      clearInterval(rotationInterval);
    });
    
    heroContainer.addEventListener('mouseleave', () => {
      isPaused = false;
      startRotation();
    });
  }
  
  // Start the rotation
  startRotation();
}

// Check for Google OAuth callback when page loads
document.addEventListener('DOMContentLoaded', function() {
  handleGoogleCallback();
  initHeroTextRotation();
});