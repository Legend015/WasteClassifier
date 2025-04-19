document.addEventListener('DOMContentLoaded', () => {
  // const themeToggle = document.getElementById('theme-toggle');
  // const body = document.getElementById('body');
  const video = document.getElementById('video');
  const cameraCanvas = document.getElementById('camera-canvas');
  const cameraBtn = document.getElementById('camera-btn');
  const uploadBtn = document.getElementById('upload-btn');
  const fileInput = document.getElementById('file-input');
  const submitBtn = document.getElementById('submit-btn');
  const output = document.getElementById('output');
  const uploadForm = document.getElementById('upload-form');
  let stream = null;

  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.getElementById('body');

  if (themeToggle && body) {
    themeToggle.textContent = body.classList.contains('dark-theme') ? 'Light Theme' : 'Dark Theme';

    themeToggle.addEventListener('click', () => {
      body.classList.toggle('dark-theme');
      body.classList.toggle('light-theme');
      themeToggle.textContent = body.classList.contains('dark-theme') ? 'Light Theme' : 'Dark Theme';
    });
  }
  // Image Preview
  function loadFile(event) {
    output.src = URL.createObjectURL(event.target.files[0]);
    video.classList.add('hidden');
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    cameraBtn.textContent = 'Take Photo';
  }

  // Camera Functionality
  if (cameraBtn) {
    cameraBtn.addEventListener('click', async () => {
      if (video.classList.contains('hidden')) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          video.srcObject = stream;
          video.classList.remove('hidden');
          cameraBtn.textContent = 'Capture Photo';
        } catch (err) {
          console.error('Error accessing camera:', err);
          alert('Could not access camera. Please ensure permissions are granted.');
        }
      } else {
        capturePhoto();
      }
    });
  }

  function capturePhoto() {
    const context = cameraCanvas.getContext('2d');
    cameraCanvas.width = video.videoWidth;
    cameraCanvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    output.src = cameraCanvas.toDataURL('image/png');

    // Convert canvas to blob and add to form
    cameraCanvas.toBlob(blob => {
      const file = new File([blob], 'captured_image.png', { type: 'image/png' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
    });

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    video.classList.add('hidden');
    cameraBtn.textContent = 'Take Photo';
  }

  // Upload Button
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', loadFile);
  }

  // Submit Form
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      if (!fileInput.files.length) {
        e.preventDefault();
        alert('Please upload or capture an image first.');
        return;
      }
      document.getElementById('loading').classList.remove('hidden');
    });
  }

  // Three.js Animation
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas'), alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const particlesGeometry = new THREE.BufferGeometry();
  const particleCount = 5000;
  const posArray = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 1000;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const material = new THREE.PointsMaterial({ size: 0.5, color: 0x00ff00 });
  const particles = new THREE.Points(particlesGeometry, material);
  scene.add(particles);

  camera.position.z = 100;

  function animate() {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.001;
    renderer.render(scene, camera);
  }
  animate();

  // Window Resize Handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Fetch Blogs via NewsAPI
  fetch('https://newsapi.org/v2/everything?q=environmental+safety&apiKey=c9a89e95937543fc95d3b60851f52630')
    .then(response => response.json())
    .then(data => {
      const carouselContent = document.getElementById('carousel-content');
      if (carouselContent) {
        data.articles.slice(0, 5).forEach((article, index) => {
          const item = document.createElement('div');
          item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
          item.innerHTML = `
            <div class="flex justify-center">
              <div class="max-w-md">
                <img src="${article.urlToImage || 'https://via.placeholder.com/800x300'}" class="d-block w-full h-48 object-cover rounded-lg" alt="${article.title}">
                <div class="carousel-caption p-4">
                  <h5 class="text-lg font-semibold">${article.title}</h5>
                  <p class="text-sm">${article.description || 'No description available.'}</p>
                  <a href="${article.url}" target="_blank" class="btn btn-primary btn-sm">Read More</a>
                </div>
              </div>
            </div>
          `;
          carouselContent.appendChild(item);
        });
      }
    })
    .catch(error => console.error('Error fetching blogs:', error));
});