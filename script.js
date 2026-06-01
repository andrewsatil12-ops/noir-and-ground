document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for slow fade-ins
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach(el => observer.observe(el));

  // GSAP Image Sequence for Hero
  gsap.registerPlugin(ScrollTrigger);

  const canvas = document.getElementById("hero-canvas");
  if (canvas) {
    const context = canvas.getContext("2d");

    const frameCount = 174;
    const currentFrame = index => (
      `images/hero_sequence/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
    );

    const images = [];
    const coffeeSequence = {
      frame: 0
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images.push(img);
    }

    function render() {
      const img = images[coffeeSequence.frame];
      if(!img) return;

      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, img.width, img.height,
                        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    }

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    }

    // Initialize size and add listener
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    images[0].onload = render;

    gsap.to(coffeeSequence, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "+=300%",
        scrub: 0.5,
        pin: true,
      },
      onUpdate: render
    });
  }

  // Lightbox Logic
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.querySelector('.lightbox-close');
  const triggers = Array.from(document.querySelectorAll('.lightbox-trigger'));
  
  let currentGallery = [];
  let currentIndex = 0;

  if(lightbox && lightboxImg) {
    triggers.forEach(img => {
      const card = img.closest('.slide, .drink-item');
      const section = img.closest('section');
      
      if(card) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          if(card.closest('.slider-track') && window.isDragging) return;
          
          currentGallery = Array.from(section.querySelectorAll('.lightbox-trigger'));
          currentIndex = currentGallery.indexOf(img);
          
          lightbox.style.display = "block";
          setTimeout(() => lightbox.classList.add('show'), 10);
          updateLightboxImage();
          document.body.style.overflow = 'hidden';
        });
      }
    });

    const updateLightboxImage = () => {
      lightboxImg.style.opacity = '0';
      setTimeout(() => {
        if(currentGallery[currentIndex]) {
          lightboxImg.src = currentGallery[currentIndex].src;
        }
        lightboxImg.style.opacity = '1';
      }, 200);
    };

    const showNext = () => {
      if (currentGallery.length <= 1) return;
      currentIndex = (currentIndex + 1) % currentGallery.length;
      updateLightboxImage();
    };

    const showPrev = () => {
      if (currentGallery.length <= 1) return;
      currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
      updateLightboxImage();
    };

    const closeLightbox = () => {
      lightbox.classList.remove('show');
      setTimeout(() => {
        lightbox.style.display = "none";
        document.body.style.overflow = 'auto';
        currentGallery = [];
      }, 400);
    };

    closeBtn.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    const nextBtn = document.querySelector('.lightbox-next');
    const prevBtn = document.querySelector('.lightbox-prev');
    if(nextBtn) nextBtn.addEventListener('click', showNext);
    if(prevBtn) prevBtn.addEventListener('click', showPrev);

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('show')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    });

    // Touch Swipe Logic
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    lightbox.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) showNext();
      if (touchEndX - touchStartX > 50) showPrev();
    });
  }

  // Story Video Sequencing
  const video1 = document.getElementById('bg-video-1');
  const video2 = document.getElementById('bg-video-2');

  if(video1 && video2) {
    // Attempt autoplay immediately
    video1.play().catch(e => console.log("Autoplay prevented", e));
    
    video1.addEventListener('ended', () => {
      video1.classList.remove('active');
      video2.classList.add('active');
      video2.currentTime = 0;
      video2.play();
    });

    video2.addEventListener('ended', () => {
      video2.classList.remove('active');
      video1.classList.add('active');
      video1.currentTime = 0;
      video1.play();
    });
  }

  // Slider Logic
  const slider = document.getElementById('env-slider');
  const progressBar = document.getElementById('slider-progress');
  
  if(slider) {
    let isDown = false;
    let startX;
    let scrollLeft;
    window.isDragging = false;

    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      window.isDragging = false;
      slider.style.cursor = 'grabbing';
      slider.style.scrollSnapType = 'none';
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
      isDown = false;
      slider.style.cursor = 'grab';
      slider.style.scrollSnapType = 'x mandatory';
    });

    slider.addEventListener('mouseup', () => {
      isDown = false;
      slider.style.cursor = 'grab';
      slider.style.scrollSnapType = 'x mandatory';
      setTimeout(() => window.isDragging = false, 50);
    });

    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      window.isDragging = true;
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2;
      slider.scrollLeft = scrollLeft - walk;
    });

    slider.addEventListener('scroll', () => {
      const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
      const scrollPercentage = slider.scrollLeft / maxScrollLeft;
      if(progressBar) {
        progressBar.style.transform = `translateX(${scrollPercentage * 300}%)`;
      }
    });
  }
});
