const html = document.documentElement;
const body = document.body;
const menuTugma = document.querySelector('.menu-tugma');
const havolalar = document.querySelector('.havolalar');
const mavzuTugma = document.querySelector('.mavzu-tugma');
const yuklanishEkrani = document.querySelector('.yuklanish-ekrani');
const yuklanishIchi = document.querySelector('.yuklanish-ichki');
const sahifaBoshi = document.querySelector('.sahifa-boshi');
const yuklanishBirMarta = sessionStorage.getItem('mahorat_loader_shown') === '1';

if (yuklanishBirMarta) {
  yuklanishEkrani?.classList.add('yashirildi');
  body?.classList.add('sahifa-tayyor');
} else {
  body?.classList.add('sahifa-yuklanmoqda');
}

const saqlanganMavzu = localStorage.getItem('mavzu');
if (saqlanganMavzu === 'tungi') {
  html.setAttribute('data-mavzu', 'tungi');
}

function mavzuBelgisiYangilash() {
  const tungi = html.getAttribute('data-mavzu') === 'tungi';
  if (!mavzuTugma) return;
  mavzuTugma.setAttribute('aria-label', tungi ? 'Yorugʻ mavzuga o‘tish' : 'Tungi mavzuga o‘tish');
  mavzuTugma.innerHTML = tungi
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.8V5.1M12 18.9v2.3M21.2 12h-2.3M5.1 12H2.8M18.5 5.5l-1.6 1.6M7.1 16.9l-1.6 1.6M18.5 18.5l-1.6-1.6M7.1 7.1L5.5 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.1 14.2A8.5 8.5 0 0 1 9.8 3.9a8.9 8.9 0 1 0 10.3 10.3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
}

function yuklanishQismlariniTayyorlash() {
  if (!yuklanishIchi || yuklanishIchi.querySelector('.yuklanish-foiz')) return;
  const foiz = document.createElement('div');
  foiz.className = 'yuklanish-foiz';
  foiz.textContent = '0%';

  const nuqtalar = document.createElement('div');
  nuqtalar.className = 'yuklanish-nuqta-qatori';
  nuqtalar.innerHTML = '<span></span><span></span><span></span>';

  const chiziq = yuklanishIchi.querySelector('.yuklanish-chiziq');
  if (chiziq) {
    yuklanishIchi.insertBefore(foiz, chiziq);
    yuklanishIchi.appendChild(nuqtalar);
  }
}

let yuklandi = false;
let engKamKutilishTugadi = false;
let yuklanishYopildi = false;

function yuklanishFoiziniYurgizish() {
  if (yuklanishBirMarta) {
    yuklandi = true;
    engKamKutilishTugadi = true;
    yuklanishniYakunlash();
    return;
  }

  const foizElement = document.querySelector('.yuklanish-foiz');
  if (!foizElement) {
    engKamKutilishTugadi = true;
    return;
  }

  const boshlanganVaqt = performance.now();
  const davomiylik = 2000;

  function formatFoiz(qiymat) {
    return `${Math.min(100, Math.round(qiymat))}%`;
  }

  function qadam(hozir) {
    const ulush = Math.min((hozir - boshlanganVaqt) / davomiylik, 1);
    const yumshoq = 1 - Math.pow(1 - ulush, 3);
    foizElement.textContent = formatFoiz(yumshoq * 100);

    if (ulush < 1) {
      requestAnimationFrame(qadam);
      return;
    }

    engKamKutilishTugadi = true;
    yuklanishniYakunlash();
  }

  requestAnimationFrame(qadam);
}

function yuklanishniYakunlash() {
  if (!yuklanishEkrani || yuklanishYopildi || !yuklandi || !engKamKutilishTugadi) return;
  yuklanishYopildi = true;
  yuklanishEkrani.classList.add('yashirildi');
  body?.classList.remove('sahifa-yuklanmoqda');
  body?.classList.add('sahifa-tayyor');
  sessionStorage.setItem('mahorat_loader_shown', '1');
}

function sonniFormatlash(raqam, aslMatn) {
  const belgilar = aslMatn.replace(/[\d\s.,]/g, '');
  const formatlangan = String(raqam).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatlangan}${belgilar}`;
}

function sonlarniJonlantirish() {
  const kartalar = document.querySelectorAll('.stat-karta strong');
  if (!kartalar.length) return;

  const kuzatuvchi = new IntersectionObserver((yozuvlar) => {
    yozuvlar.forEach((yozuv) => {
      if (!yozuv.isIntersecting) return;

      const element = yozuv.target;
      const aslMatn = element.dataset.aslQiymat || element.textContent.trim();
      element.dataset.aslQiymat = aslMatn;
      const raqam = parseInt(aslMatn.replace(/\D/g, ''), 10);
      if (!raqam) {
        kuzatuvchi.unobserve(element);
        return;
      }

      const boshlangan = performance.now();
      const davomiylik = 1600;

      function qadam(hozir) {
        const ulush = Math.min((hozir - boshlangan) / davomiylik, 1);
        const yumshoq = 1 - Math.pow(1 - ulush, 3);
        element.textContent = sonniFormatlash(Math.round(raqam * yumshoq), aslMatn);
        if (ulush < 1) {
          requestAnimationFrame(qadam);
        } else {
          element.textContent = aslMatn;
        }
      }

      requestAnimationFrame(qadam);
      kuzatuvchi.unobserve(element);
    });
  }, {
    threshold: 0.75
  });

  kartalar.forEach((element) => kuzatuvchi.observe(element));
}

function jonlanishBelgilariniTaqsimlash() {
  const chapdagilar = document.querySelectorAll('.qahramon-matn, .ichki-qahramon-matn, .bolim-boshi');
  const ongdagilar = document.querySelectorAll('.qahramon-rasm, .ichki-qahramon-rasm, .jadval-qobiq');
  const kichiklar = document.querySelectorAll('.ustma-karta, .qator-chip, .oyoq-pastki');

  chapdagilar.forEach((element) => {
    element.setAttribute('data-jonlanish', '');
    element.dataset.jonTuri = 'chap';
  });

  ongdagilar.forEach((element) => {
    element.setAttribute('data-jonlanish', '');
    element.dataset.jonTuri = 'ong';
  });

  kichiklar.forEach((element, index) => {
    element.setAttribute('data-jonlanish', '');
    element.dataset.jonTuri = 'kichik';
    element.style.setProperty('--kechikish', `${index * 90}ms`);
  });

  const guruhlar = document.querySelectorAll(
    '.qisqa-statlar, .tortlik-panjarasi, .uchlik-panjarasi, .ikkilik-panjarasi, .yangilik-panjarasi, .galereya-panjarasi, .dastur-panjarasi, .jamoa-panjarasi, .savol-panjarasi, .aloqa-panjarasi, .qadam-panjarasi, .bosqich-panjarasi, .oyoq-panjarasi, .narx-grant-panjarasi, .faq-akkordeon'
  );

  guruhlar.forEach((guruh) => {
    const bolalar = [...guruh.children].filter((element) => element.nodeType === 1);
    bolalar.forEach((element, index) => {
      element.setAttribute('data-jonlanish', '');
      element.dataset.jonTuri = 'past';
      element.style.setProperty('--kechikish', `${Math.min(index, 5) * 90}ms`);
    });
  });

  document.querySelectorAll('.qabul-karta').forEach((element) => {
    element.setAttribute('data-jonlanish', '');
    element.dataset.jonTuri = 'zoom';
  });
}

function koRinishAnimatsiyasiniYoqish() {
  jonlanishBelgilariniTaqsimlash();

  const kuzatuvchi = new IntersectionObserver((yozuvlar) => {
    yozuvlar.forEach((yozuv) => {
      if (yozuv.isIntersecting) {
        yozuv.target.classList.add('korindi');
        kuzatuvchi.unobserve(yozuv.target);
      }
    });
  }, {
    threshold: 0.16,
    rootMargin: '0px 0px -70px 0px'
  });

  document.querySelectorAll('[data-jonlanish]').forEach((element) => {
    kuzatuvchi.observe(element);
  });
}

function qahramonParallaksiniYoqish() {
  const rasm = document.querySelector('.qahramon-rasm .asosiy-rasm, .ichki-qahramon-rasm img');
  const qobiq = document.querySelector('.qahramon-rasm, .ichki-qahramon-rasm');
  if (!rasm || !qobiq) return;

  let band = false;

  const yangila = () => {
    const holat = qobiq.getBoundingClientRect();
    const siljish = Math.max(-14, Math.min(14, holat.top * -0.045));
    rasm.style.transform = `translate3d(0, ${siljish}px, 0) scale(1.035)`;
    band = false;
  };

  const sorash = () => {
    if (band) return;
    band = true;
    requestAnimationFrame(yangila);
  };

  window.addEventListener('scroll', sorash, { passive: true });
  window.addEventListener('resize', sorash);
  sorash();
}

function boshQismHolatiniYangilash() {
  if (!sahifaBoshi) return;
  sahifaBoshi.classList.toggle('siljidi', window.scrollY > 12);
}

function tepagaTugmasiniYoqish() {
  if (!body) return;

  const asosiy = document.querySelector('.asosiy-qism');
  const birinchiBolim = asosiy?.querySelector('section');
  if (!birinchiBolim) return;

  let tugma = document.querySelector('.tepaga-tugma');
  if (!tugma) {
    tugma = document.createElement('button');
    tugma.type = 'button';
    tugma.className = 'tepaga-tugma';
    tugma.setAttribute('aria-label', 'Sahifa boshiga qaytish');
    tugma.setAttribute('title', 'Tepaga chiqish');
    tugma.innerHTML = '<span class="tepaga-tugma-ikon" aria-hidden="true"><i class="fa-solid fa-arrow-up"></i></span>';
    body.appendChild(tugma);
  }

  const holatniYangilash = () => {
    const tugashNuqtasi = birinchiBolim.offsetTop + birinchiBolim.offsetHeight - 140;
    const korinsin = window.scrollY > Math.max(160, tugashNuqtasi);
    tugma.classList.toggle('korinadi', korinsin);
    tugma.toggleAttribute('aria-hidden', !korinsin);
    tugma.tabIndex = korinsin ? 0 : -1;
  };

  tugma.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', holatniYangilash, { passive: true });
  window.addEventListener('resize', holatniYangilash);
  window.addEventListener('load', holatniYangilash);
  requestAnimationFrame(holatniYangilash);
}

mavzuBelgisiYangilash();
if (!yuklanishBirMarta) {
  yuklanishQismlariniTayyorlash();
  yuklanishFoiziniYurgizish();
}
koRinishAnimatsiyasiniYoqish();
sonlarniJonlantirish();
qahramonParallaksiniYoqish();
boshQismHolatiniYangilash();
tepagaTugmasiniYoqish();
faqAkkordeoniniYoqish();

mavzuTugma?.addEventListener('click', () => {
  const tungi = html.getAttribute('data-mavzu') === 'tungi';
  if (tungi) {
    html.removeAttribute('data-mavzu');
    localStorage.setItem('mavzu', 'yorug');
  } else {
    html.setAttribute('data-mavzu', 'tungi');
    localStorage.setItem('mavzu', 'tungi');
  }
  mavzuBelgisiYangilash();
});

menuTugma?.addEventListener('click', () => {
  menuTugma.classList.toggle('faol');
  havolalar?.classList.toggle('ochiq');
});

havolalar?.querySelectorAll('a').forEach((havola) => {
  havola.addEventListener('click', () => {
    if (window.innerWidth <= 840) {
      menuTugma?.classList.remove('faol');
      havolalar?.classList.remove('ochiq');
    }
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 840) {
    menuTugma?.classList.remove('faol');
    havolalar?.classList.remove('ochiq');
  }
});

window.addEventListener('scroll', boshQismHolatiniYangilash, { passive: true });
window.addEventListener('load', () => {
  yuklandi = true;
  yuklanishniYakunlash();
});

if (!yuklanishBirMarta) {
  setTimeout(() => {
    yuklandi = true;
    yuklanishniYakunlash();
  }, 2400);
}


function sliderlarniYoqish() {
  const sliderlar = document.querySelectorAll('[data-slider]');
  if (!sliderlar.length) return;

  sliderlar.forEach((slider) => {
    const trek = slider.querySelector('.mazmun-slidery-trek');
    const slaydlar = Array.from(slider.querySelectorAll('.mazmun-slayd'));
    const oldingiTugma = slider.querySelector('[data-slider-prev]');
    const keyingiTugma = slider.querySelector('[data-slider-next]');
    const nuqtalarQatori = slider.querySelector('[data-slider-dots]');
    const kechikish = Number(slider.dataset.sliderDelay) || 5200;

    if (!trek || slaydlar.length <= 1) return;

    let joriy = 0;
    let vaqtlagich = null;
    let oxirgiMediaBalandligi = 0;
    let oxirgiSliderBalandligi = 0;

    function nuqtalarniQurish() {
      if (!nuqtalarQatori) return [];
      nuqtalarQatori.innerHTML = '';
      return slaydlar.map((_, index) => {
        const tugma = document.createElement('button');
        tugma.type = 'button';
        tugma.className = 'slayder-nuqta';
        tugma.setAttribute('aria-label', `${index + 1}-slaydga o‘tish`);
        tugma.addEventListener('click', () => {
          joriy = index;
          slayderniYangilash();
          avtomatikniQaytaIshgaTushir();
        });
        nuqtalarQatori.appendChild(tugma);
        return tugma;
      });
    }

    const nuqtalar = nuqtalarniQurish();

    function kerakliHomeSliderMediaBalandligi() {
      if (window.innerWidth <= 560) return 180;
      if (window.innerWidth <= 840) return 210;
      if (window.innerWidth <= 1080) return 230;
      return 250;
    }

    function sliderIchidagiMedialarniBirxillashtir() {
      const mediaElementlar = Array.from(
        slider.querySelectorAll('.mazmun-slayd .yangilik-karta img, .mazmun-slayd .galereya-karta img, .mazmun-slayd .foto-katta-rasm')
      );

      if (!mediaElementlar.length) return;

      const belgilanganBalandlik = kerakliHomeSliderMediaBalandligi();
      if (!belgilanganBalandlik || belgilanganBalandlik === oxirgiMediaBalandligi) return;

      oxirgiMediaBalandligi = belgilanganBalandlik;
      slider.style.setProperty('--home-slider-media-height', `${belgilanganBalandlik}px`);

      mediaElementlar.forEach((element) => {
        element.style.height = `${belgilanganBalandlik}px`;
        if (element.classList.contains('foto-katta-rasm')) {
          element.style.aspectRatio = 'auto';
        }
      });
    }

    function sliderBalandliginiBarqarorla() {
      const balandliklar = slaydlar
        .map((slayd) => Math.ceil(slayd.offsetHeight))
        .filter((balandlik) => balandlik > 0);

      if (!balandliklar.length) return;

      const engBaland = Math.max(...balandliklar);
      if (!engBaland || engBaland === oxirgiSliderBalandligi) return;

      oxirgiSliderBalandligi = engBaland;
      trek.style.height = `${engBaland}px`;
    }

    function slayderniYangilash() {
      trek.style.transform = `translateX(-${joriy * 100}%)`;
      slaydlar.forEach((slayd, index) => {
        slayd.classList.toggle('faol', index === joriy);
        slayd.setAttribute('aria-hidden', index === joriy ? 'false' : 'true');
      });
      nuqtalar.forEach((nuqta, index) => {
        nuqta.classList.toggle('faol', index === joriy);
      });

      sliderIchidagiMedialarniBirxillashtir();
      sliderBalandliginiBarqarorla();
    }

    function keyingi() {
      joriy = (joriy + 1) % slaydlar.length;
      slayderniYangilash();
    }

    function oldingi() {
      joriy = (joriy - 1 + slaydlar.length) % slaydlar.length;
      slayderniYangilash();
    }

    function avtomatikniToxtat() {
      if (vaqtlagich) {
        window.clearInterval(vaqtlagich);
        vaqtlagich = null;
      }
    }

    function avtomatikniIshgaTushir() {
      avtomatikniToxtat();
      vaqtlagich = window.setInterval(keyingi, kechikish);
    }

    function avtomatikniQaytaIshgaTushir() {
      avtomatikniIshgaTushir();
    }

    keyingiTugma?.addEventListener('click', () => {
      keyingi();
      avtomatikniQaytaIshgaTushir();
    });

    oldingiTugma?.addEventListener('click', () => {
      oldingi();
      avtomatikniQaytaIshgaTushir();
    });

    slider.addEventListener('mouseenter', avtomatikniToxtat);
    slider.addEventListener('mouseleave', avtomatikniIshgaTushir);
    slider.addEventListener('focusin', avtomatikniToxtat);
    slider.addEventListener('focusout', avtomatikniIshgaTushir);

    slayderniYangilash();
    window.addEventListener('resize', slayderniYangilash);
    window.addEventListener('load', slayderniYangilash);
    slaydlar.forEach((slayd) => {
      slayd.querySelectorAll('img').forEach((rasm) => {
        if (!rasm.complete) {
          rasm.addEventListener('load', slayderniYangilash, { once: true });
        }
      });
    });
    if (window.ResizeObserver) {
      const kuzatuvchi = new ResizeObserver(() => {
        requestAnimationFrame(slayderniYangilash);
      });
      slaydlar.forEach((slayd) => kuzatuvchi.observe(slayd));
    }
    avtomatikniIshgaTushir();
  });
}

sliderlarniYoqish();

function fotoGalereyalarniYoqish() {
  const galereyalar = document.querySelectorAll('[data-gallery-slider]');
  if (!galereyalar.length) return;

  galereyalar.forEach((galereya) => {
    const trek = galereya.querySelector('.foto-galereya-track');
    const slaydlar = Array.from(galereya.querySelectorAll('.foto-katta-slayd'));
    const oldingiTugma = galereya.querySelector('[data-gallery-prev]');
    const keyingiTugma = galereya.querySelector('[data-gallery-next]');
    const nuqtalarQatori = galereya.querySelector('[data-gallery-dots]');
    const kechikish = Number(galereya.dataset.sliderDelay) || 4300;

    if (!trek || slaydlar.length <= 1) return;

    let joriy = 0;
    let vaqtlagich = null;
    let oxirgiGalereyaBalandligi = 0;
    let oxirgiRasmBalandligi = 0;

    function nuqtalarniQurish() {
      if (!nuqtalarQatori) return [];
      nuqtalarQatori.innerHTML = '';
      return slaydlar.map((_, index) => {
        const tugma = document.createElement('button');
        tugma.type = 'button';
        tugma.className = 'foto-galereya-nuqta';
        tugma.setAttribute('aria-label', `${index + 1}-rasmga o‘tish`);
        tugma.addEventListener('click', () => {
          joriy = index;
          yangilash();
          avtomatikniQaytaIshgaTushir();
        });
        nuqtalarQatori.appendChild(tugma);
        return tugma;
      });
    }

    const nuqtalar = nuqtalarniQurish();

    function rasmBalandliginiBirxillashtir() {
      const engYaqinSlider = galereya.closest('.mazmun-slidery');
      const tashqiBalandlik = engYaqinSlider
        ? parseFloat(getComputedStyle(engYaqinSlider).getPropertyValue('--home-slider-media-height'))
        : 0;

      const rasmOrovlari = slaydlar
        .map((slayd) => slayd.querySelector('.foto-katta-rasm'))
        .filter(Boolean);

      if (!rasmOrovlari.length) return;

      rasmOrovlari.forEach((orov) => {
        orov.style.removeProperty('height');
        orov.style.removeProperty('aspect-ratio');
      });

      const topilganBalandliklar = rasmOrovlari
        .map((orov) => Math.round(orov.getBoundingClientRect().height))
        .filter((balandlik) => balandlik > 0);

      const engKichikRasmBalandligi = tashqiBalandlik > 0
        ? Math.round(tashqiBalandlik)
        : (topilganBalandliklar.length ? Math.min(...topilganBalandliklar) : 0);

      if (!engKichikRasmBalandligi || engKichikRasmBalandligi === oxirgiRasmBalandligi) return;

      oxirgiRasmBalandligi = engKichikRasmBalandligi;

      rasmOrovlari.forEach((orov) => {
        orov.style.height = `${engKichikRasmBalandligi}px`;
        orov.style.aspectRatio = 'auto';
      });
    }

    function galereyaBalandliginiBarqarorla() {
      const balandliklar = slaydlar
        .map((slayd) => Math.ceil(slayd.offsetHeight))
        .filter((balandlik) => balandlik > 0);

      if (!balandliklar.length) return;

      const engBaland = Math.max(...balandliklar);
      if (!engBaland || engBaland === oxirgiGalereyaBalandligi) return;

      oxirgiGalereyaBalandligi = engBaland;
      trek.style.height = `${engBaland}px`;
    }

    function yangilash() {
      slaydlar.forEach((slayd, index) => {
        const faol = index === joriy;
        slayd.classList.toggle('faol', faol);
        slayd.setAttribute('aria-hidden', faol ? 'false' : 'true');
      });
      nuqtalar.forEach((nuqta, index) => {
        nuqta.classList.toggle('faol', index === joriy);
      });

      rasmBalandliginiBirxillashtir();
      galereyaBalandliginiBarqarorla();
    }

    function keyingi() {
      joriy = (joriy + 1) % slaydlar.length;
      yangilash();
    }

    function oldingi() {
      joriy = (joriy - 1 + slaydlar.length) % slaydlar.length;
      yangilash();
    }

    function avtomatikniToxtat() {
      if (vaqtlagich) {
        window.clearInterval(vaqtlagich);
        vaqtlagich = null;
      }
    }

    function avtomatikniIshgaTushir() {
      avtomatikniToxtat();
      vaqtlagich = window.setInterval(keyingi, kechikish);
    }

    function avtomatikniQaytaIshgaTushir() {
      avtomatikniIshgaTushir();
    }

    oldingiTugma?.addEventListener('click', () => {
      oldingi();
      avtomatikniQaytaIshgaTushir();
    });

    keyingiTugma?.addEventListener('click', () => {
      keyingi();
      avtomatikniQaytaIshgaTushir();
    });

    galereya.addEventListener('mouseenter', avtomatikniToxtat);
    galereya.addEventListener('mouseleave', avtomatikniIshgaTushir);
    galereya.addEventListener('focusin', avtomatikniToxtat);
    galereya.addEventListener('focusout', avtomatikniIshgaTushir);

    yangilash();
    window.addEventListener('resize', yangilash);
    window.addEventListener('load', yangilash);
    slaydlar.forEach((slayd) => {
      slayd.querySelectorAll('img').forEach((rasm) => {
        if (!rasm.complete) {
          rasm.addEventListener('load', yangilash, { once: true });
        }
      });
    });
    if (window.ResizeObserver) {
      const kuzatuvchi = new ResizeObserver(() => {
        requestAnimationFrame(yangilash);
      });
      slaydlar.forEach((slayd) => kuzatuvchi.observe(slayd));
    }
    avtomatikniIshgaTushir();
  });
}

fotoGalereyalarniYoqish();


function faqAkkordeoniniYoqish() {
  const bloklar = [...document.querySelectorAll('[data-faq] .faq-item')];
  if (!bloklar.length) return;

  const faolOtimlar = new WeakMap();

  const ol = (blok) => ({
    tugma: blok.querySelector('.faq-sarlavha'),
    javob: blok.querySelector('.faq-javob')
  });

  const ichkiniTayyorla = (javob) => {
    if (!javob || javob.querySelector('.faq-javob-ichki')) return;
    const ichki = document.createElement('div');
    ichki.className = 'faq-javob-ichki';

    while (javob.firstChild) {
      ichki.appendChild(javob.firstChild);
    }

    javob.appendChild(ichki);
  };

  const faolOtimniToxtat = (javob) => {
    const eski = faolOtimlar.get(javob);
    if (!eski) return;
    javob.removeEventListener('transitionend', eski);
    faolOtimlar.delete(javob);
  };

  const balandlikniOl = (javob) => {
    const ichki = javob.querySelector('.faq-javob-ichki');
    return ichki ? Math.ceil(ichki.scrollHeight) : Math.ceil(javob.scrollHeight);
  };

  const ochish = (blok) => {
    const { tugma, javob } = ol(blok);
    if (!tugma || !javob) return;

    faolOtimniToxtat(javob);
    javob.hidden = false;

    const boshlanish = javob.offsetHeight;
    const yakun = balandlikniOl(javob);

    blok.classList.add('ochiq');
    tugma.setAttribute('aria-expanded', 'true');

    javob.style.height = `${boshlanish}px`;
    javob.style.opacity = boshlanish > 0 ? '1' : '0';
    javob.style.transform = boshlanish > 0 ? 'translateY(0)' : 'translateY(-8px)';

    requestAnimationFrame(() => {
      javob.style.height = `auto`;
      javob.style.opacity = '1';
      javob.style.transform = 'translateY(0)';
    });

    const tugadi = (hodisa) => {
      if (hodisa.target !== javob || hodisa.propertyName !== 'height') return;
      faolOtimniToxtat(javob);

      if (blok.classList.contains('ochiq')) {
        javob.style.height = 'auto';
      }
    };

    faolOtimlar.set(javob, tugadi);
    javob.addEventListener('transitionend', tugadi);
  };

  const yopish = (blok) => {
    const { tugma, javob } = ol(blok);
    if (!tugma || !javob) return;

    faolOtimniToxtat(javob);

    const boshlanish = javob.offsetHeight || balandlikniOl(javob);

    tugma.setAttribute('aria-expanded', 'false');
    blok.classList.remove('ochiq');

    javob.style.height = `${boshlanish}px`;
    javob.style.opacity = '1';
    javob.style.transform = 'translateY(0)';

    requestAnimationFrame(() => {
      javob.style.height = '0px';
      javob.style.opacity = '0';
      javob.style.transform = 'translateY(-8px)';
    });

    const tugadi = (hodisa) => {
      if (hodisa.target !== javob || hodisa.propertyName !== 'height') return;
      faolOtimniToxtat(javob);

      if (!blok.classList.contains('ochiq')) {
        javob.hidden = false;
      }
    };

    faolOtimlar.set(javob, tugadi);
    javob.addEventListener('transitionend', tugadi);
  };

  bloklar.forEach((blok, index) => {
    const { tugma, javob } = ol(blok);
    if (!tugma || !javob) return;

    ichkiniTayyorla(javob);

    const javobId = `faq-javob-${index + 1}`;
    javob.id = javobId;
    tugma.setAttribute('aria-controls', javobId);
    tugma.setAttribute('aria-expanded', 'false');
    javob.hidden = false;
    javob.style.height = '0px';
    javob.style.opacity = '0';
    javob.style.transform = 'translateY(-8px)';

    tugma.addEventListener('click', () => {
      const ochiqmi = blok.classList.contains('ochiq');

      bloklar.forEach((b) => {
        if (b !== blok) {
          yopish(b);
        }
      });

      if (ochiqmi) {
        yopish(blok);
      } else {
        ochish(blok);
      }
    });
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      bloklar.forEach((blok) => {
        const { javob } = ol(blok);
        if (!javob || !blok.classList.contains('ochiq')) return;

        const yangiBalandlik = balandlikniOl(javob);
        javob.style.height = `${yangiBalandlik}px`;

        requestAnimationFrame(() => {
          if (blok.classList.contains('ochiq')) {
            javob.style.height = 'auto';
          }
        });
      });
    }, 110);
  });
}
