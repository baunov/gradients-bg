import './style.scss';
import './firebaseConfig.js';

document.addEventListener('DOMContentLoaded', () => {
  // Interactive bubble animation code
  const interBubble = document.querySelector<HTMLDivElement>('.interactive')!;
  let curX = 0;
  let curY = 0;
  let tgX = 0;
  let tgY = 0;

  function move() {
    curX += (tgX - curX) / 20;
    curY += (tgY - curY) / 20;
    interBubble.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
    requestAnimationFrame(() => {
      move();
    });
  }

  window.addEventListener('mousemove', (event) => {
    tgX = event.clientX;
    tgY = event.clientY;
  });

  move();

  // Section switching functionality
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('.sidebar-navigation a');
  const mainContentWrapper = document.querySelector<HTMLDivElement>('.main-content-wrapper');
  
  const handleNavigation = (event: Event) => {
    event.preventDefault();
    const targetLink = event.currentTarget as HTMLAnchorElement;
    
    const targetId = targetLink.getAttribute('href')?.substring(1);
    if (!targetId || !mainContentWrapper) return;
    
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    // Update active states
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.remove('active');
    });
    targetSection.classList.add('active');
    
    navLinks.forEach(link => {
      link.parentElement?.classList.remove('active');
    });
    targetLink.parentElement?.classList.add('active');
    
    // Scroll to section
    mainContentWrapper.scrollTo({
      top: targetSection.offsetTop,
      behavior: 'smooth'
    });

    history.pushState(null, '', `#${targetId}`);
  };
  
  // Add click handlers to nav links
  navLinks.forEach(link => {
    link.addEventListener('click', handleNavigation);
  });
  
  // Handle initial page load
  const handleInitialLoad = () => {
    const hash = window.location.hash.substring(1);
    const validSections = ['home', 'donate', 'transparency', 'visualization'];
    
    if (hash && validSections.includes(hash)) {
      const initialSection = document.getElementById(hash);
      if (initialSection && mainContentWrapper) {
        document.querySelectorAll('.content-section').forEach(section => {
          section.classList.remove('active');
        });
        initialSection.classList.add('active');
        
        navLinks.forEach(link => {
          link.parentElement?.classList.remove('active');
          if (link.getAttribute('href') === `#${hash}`) {
            link.parentElement?.classList.add('active');
          }
        });
        
        // Scroll to section on initial load if hash exists
        mainContentWrapper.scrollTo({
          top: initialSection.offsetTop,
          behavior: 'auto'
        });
      }
    }
  };
  
  handleInitialLoad();
  
  // Make Donate Now button work
  const donateButton = document.querySelector<HTMLButtonElement>('.donate-now-button');
  if (donateButton) {
    donateButton.addEventListener('click', (e) => {
      e.preventDefault();
      const donateLink = document.querySelector<HTMLAnchorElement>('a[href="#donate"]');
      if (donateLink) {
        donateLink.click();
      }
    });
  }

  
});

